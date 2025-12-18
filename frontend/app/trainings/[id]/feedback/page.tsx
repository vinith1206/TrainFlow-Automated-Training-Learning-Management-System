'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Star, MessageSquare } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useState } from 'react'

export default function FeedbackPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const trainingId = params.id as string

  const [rating, setRating] = useState(0)
  const [trainerRating, setTrainerRating] = useState(0)
  const [comment, setComment] = useState('')
  const [trainerComment, setTrainerComment] = useState('')

  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['feedbacks', trainingId],
    queryFn: async () => {
      const response = await api.get(`/trainings/${trainingId}/feedback`)
      return response.data
    },
  })

  const { data: analytics } = useQuery({
    queryKey: ['feedback-analytics', trainingId],
    queryFn: async () => {
      const response = await api.get(`/trainings/${trainingId}/feedback/analytics`)
      return response.data
    },
  })

  const { data: training } = useQuery({
    queryKey: ['training', trainingId],
    queryFn: async () => {
      const response = await api.get(`/trainings/${trainingId}`)
      return response.data
    },
  })

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/trainings/${trainingId}/feedback`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', trainingId] })
      queryClient.invalidateQueries({ queryKey: ['feedback-analytics', trainingId] })
      setRating(0)
      setTrainerRating(0)
      setComment('')
      setTrainerComment('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitMutation.mutate({
      rating,
      comment: comment || undefined,
      trainerRating: trainerRating || undefined,
      trainerComment: trainerComment || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  const user = userStr ? JSON.parse(userStr) : null
  const hasSubmitted = feedbacks?.some((f: any) => f.userId === user?.id)
  const isParticipant = user?.role === 'PARTICIPANT'

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Feedback - {training?.name}</h1>
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{analytics.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{analytics.avgRating.toFixed(1)} ⭐</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Trainer Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{analytics.avgTrainerRating.toFixed(1)} ⭐</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {isParticipant && !hasSubmitted && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Submit Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label>Training Rating *</Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-2 rounded ${
                          rating >= star
                            ? 'text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      >
                        <Star className="h-8 w-8 fill-current" />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && <p className="text-sm text-muted-foreground mt-1">{rating} out of 5 stars</p>}
                </div>

                <div>
                  <Label htmlFor="comment">Comments</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Share your thoughts about the training..."
                  />
                </div>

                <div>
                  <Label>Trainer Rating</Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTrainerRating(star)}
                        className={`p-2 rounded ${
                          trainerRating >= star
                            ? 'text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      >
                        <Star className="h-8 w-8 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="trainerComment">Trainer Comments</Label>
                  <Textarea
                    id="trainerComment"
                    value={trainerComment}
                    onChange={(e) => setTrainerComment(e.target.value)}
                    rows={3}
                    placeholder="Share your thoughts about the trainer..."
                  />
                </div>

                <Button type="submit" disabled={submitMutation.isPending || rating === 0}>
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {isParticipant && hasSubmitted && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Thank You!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">You have already submitted your feedback for this training.</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Feedback ({feedbacks?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbacks?.map((feedback: any) => (
                <div key={feedback.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">
                        {feedback.user.firstName} {feedback.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(feedback.submittedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= feedback.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {feedback.comment && (
                    <p className="text-sm text-muted-foreground mt-2">{feedback.comment}</p>
                  )}
                  {feedback.trainerRating && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-1">Trainer Rating:</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= feedback.trainerRating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {feedback.trainerComment && (
                        <p className="text-sm text-muted-foreground mt-1">{feedback.trainerComment}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {feedbacks?.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No feedback submitted yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

