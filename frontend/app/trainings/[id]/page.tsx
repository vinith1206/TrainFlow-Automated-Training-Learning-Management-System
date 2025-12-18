'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UploadMaterial } from '@/components/materials/upload-material'
import { ReportsSection } from '@/components/reports/reports-section'
import { BulkEnrollment } from '@/components/enrollments/bulk-enrollment'
import CommentsSection from '@/components/comments/comments-section'
import { MaterialVersions } from '@/components/materials/material-versions'
import { VideoPlayer } from '@/components/video/video-player'
import { ArrowLeft, Users, FileText, CheckCircle, MessageSquare, Download, History } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function TrainingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const trainingId = params.id as string

  const { data: training, isLoading } = useQuery({
    queryKey: ['training', trainingId],
    queryFn: async () => {
      const response = await api.get(`/trainings/${trainingId}`)
      return response.data
    },
  })

  const { data: stats } = useQuery({
    queryKey: ['training-stats', trainingId],
    queryFn: async () => {
      const response = await api.get(`/trainings/${trainingId}/stats`)
      return response.data
    },
  })

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/trainings/${trainingId}/enrollments`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training', trainingId] })
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!training) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Training not found</p>
      </div>
    )
  }

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  const user = userStr ? JSON.parse(userStr) : null
  const isEnrolled = training.enrollments?.some((e: any) => e.userId === user?.id)
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
        <h1 className="text-3xl font-bold mb-2">{training.name}</h1>
        <p className="text-muted-foreground">{training.description}</p>
        <div className="flex items-center gap-4 mt-4">
          <span className={`px-3 py-1 rounded-full text-sm ${
            training.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
            training.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
            training.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {training.status}
          </span>
          <span className="text-sm text-muted-foreground">{training.mode}</span>
          {training.location && (
            <span className="text-sm text-muted-foreground">📍 {training.location}</span>
          )}
        </div>
        {isParticipant && !isEnrolled && (
          <Button onClick={() => enrollMutation.mutate()} className="mt-4" disabled={enrollMutation.isPending}>
            {enrollMutation.isPending ? 'Enrolling...' : 'Enroll in Training'}
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          {(user?.role === 'ADMIN' || user?.role === 'TRAINER') && (
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {(user?.role === 'ADMIN' || user?.role === 'TRAINER') && (
            <Card>
              <CardContent className="pt-6">
                <ReportsSection trainingId={trainingId} />
              </CardContent>
            </Card>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Start Date</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatDateTime(training.startDate)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">End Date</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatDateTime(training.endDate)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Trainer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                  {training.trainer?.firstName} {training.trainer?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{training.trainer?.email}</p>
              </CardContent>
            </Card>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)} ⭐</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Participants ({training.enrollments?.length || 0})</CardTitle>
                {(user?.role === 'ADMIN' || user?.role === 'TRAINER') && (
                  <BulkEnrollment trainingId={trainingId} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {training.enrollments?.map((enrollment: any) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-smooth">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {enrollment.user.firstName} {enrollment.user.lastName}
                        </p>
                        {enrollment.preWorkCompleted && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                            <span>✓</span> Pre-work
                          </span>
                        )}
                        {!enrollment.preWorkCompleted && training.materials?.some((m: any) => m.type === 'PRE_WORK') && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1">
                            ⚠ Pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{enrollment.user.email}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                        {enrollment.completedAt && (
                          <span>Completed: {new Date(enrollment.completedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        enrollment.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        enrollment.status === 'ENROLLED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {enrollment.status}
                      </span>
                    </div>
                  </div>
                ))}
                {training.enrollments?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No participants enrolled yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Materials ({training.materials?.length || 0})</CardTitle>
                {(user?.role === 'ADMIN' || user?.role === 'TRAINER') && (
                  <UploadMaterial trainingId={trainingId} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {training.materials?.map((material: any) => (
                  <div key={material.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{material.name}</p>
                      <p className="text-sm text-muted-foreground">{material.type}</p>
                    </div>
                    {material.fileUrl && (
                      <a 
                        href={material.fileUrl} 
                        download
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 transition-smooth active:scale-95"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    )}
                    {material.externalLink && (
                      <a 
                        href={material.externalLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 transition-smooth active:scale-95"
                      >
                        Open Link
                      </a>
                    )}
                  </div>
                ))}
                {training.materials?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No materials uploaded yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push(`/trainings/${trainingId}/attendance`)}>
                View Full Attendance Page
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Feedback ({training.feedbacks?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push(`/trainings/${trainingId}/feedback`)} className="mb-4">
                View Full Feedback Page
              </Button>
              <div className="space-y-4">
                {training.feedbacks?.slice(0, 5).map((feedback: any) => (
                  <div key={feedback.id} className="p-4 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">
                        {feedback.user.firstName} {feedback.user.lastName}
                      </p>
                      <div className="flex items-center">
                        {'⭐'.repeat(feedback.rating)}
                      </div>
                    </div>
                    {feedback.comment && (
                      <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussion">
          <CommentsSection 
            trainingId={trainingId} 
            currentUserId={user?.id || ''} 
            currentUserRole={user?.role || ''} 
          />
        </TabsContent>

        {(user?.role === 'ADMIN' || user?.role === 'TRAINER') && (
          <TabsContent value="ai-insights">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push(`/trainings/${trainingId}/ai-insights`)}>
                  View Full AI Analysis
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      </div>
    </div>
  )
}

