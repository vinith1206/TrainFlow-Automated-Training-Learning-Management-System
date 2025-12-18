'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, TrendingUp, Lightbulb, Target } from 'lucide-react'

export default function AIInsightsPage() {
  const params = useParams()
  const router = useRouter()
  const trainingId = params.id as string

  const { data: summary, isLoading } = useQuery({
    queryKey: ['ai-feedback-summary', trainingId],
    queryFn: async () => {
      const response = await api.get(`/ai/feedback/summarize/${trainingId}`)
      return response.data
    },
  })

  const { data: effectiveness } = useQuery({
    queryKey: ['ai-effectiveness', trainingId],
    queryFn: async () => {
      const response = await api.get(`/ai/effectiveness/${trainingId}`)
      return response.data
    },
  })

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <h1 className="text-3xl font-bold">AI-Powered Insights</h1>
          </div>
          <p className="text-muted-foreground">Intelligent analysis of training performance</p>
        </div>

        {effectiveness && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Training Effectiveness Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-purple-600">
                  {effectiveness.effectivenessScore}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div
                      className="bg-purple-600 h-4 rounded-full transition-all"
                      style={{ width: `${effectiveness.effectivenessScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on ratings, attendance, and completion rates
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {summary && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Feedback Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{summary.summary}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Sentiment:</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    summary.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    summary.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {summary.sentiment}
                  </span>
                </div>
              </CardContent>
            </Card>

            {summary.keyThemes && summary.keyThemes.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Key Themes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {summary.keyThemes.map((theme: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {summary.recommendations && summary.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {summary.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="h-5 w-5 text-purple-500 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}

