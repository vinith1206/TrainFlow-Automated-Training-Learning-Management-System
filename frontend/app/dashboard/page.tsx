'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { SimpleChart } from '@/components/charts/simple-chart'
import { BookOpen, Users, CheckCircle, MessageSquare, TrendingUp, Sparkles, Award, Plus, Calendar } from 'lucide-react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'TRAINER' | 'PARTICIPANT'
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (!token || !userStr) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userStr))
  }, [router])

  const { data: trainingsData, isLoading: isLoadingTrainings } = useQuery({
    queryKey: ['trainings'],
    queryFn: async () => {
      const response = await api.get('/trainings')
      // Handle paginated response
      if (response.data && response.data.data) {
        return response.data.data
      }
      // Fallback for non-paginated response
      return response.data || []
    },
    enabled: !!user,
  })

  const trainings = trainingsData || []

  // Get user's enrolled trainings for participants
  const { data: enrollmentsData } = useQuery({
    queryKey: ['user-enrollments'],
    queryFn: async () => {
      if (user?.role === 'PARTICIPANT') {
        const response = await api.get('/trainings?limit=100')
        // Handle paginated response
        const allTrainings = response.data?.data || response.data || []
        // Filter trainings where user is enrolled
        return allTrainings.filter((t: any) => 
          t.enrollments?.some((e: any) => e.userId === user.id)
        )
      }
      return []
    },
    enabled: !!user && user?.role === 'PARTICIPANT',
  })

  const enrollments = enrollmentsData || []

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      if (user?.role === 'ADMIN') {
        const response = await api.get('/trainings?limit=100')
        // Handle paginated response
        const trainings = response.data?.data || response.data || []
        return {
          totalTrainings: trainings.length,
          totalParticipants: trainings.reduce((sum: number, t: any) => sum + (t._count?.enrollments || 0), 0),
          completedTrainings: trainings.filter((t: any) => t.status === 'COMPLETED').length,
        }
      }
      return null
    },
    enabled: user?.role === 'ADMIN',
  })


  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, {user.firstName}!</p>
        </div>

        {user.role === 'ADMIN' && stats && (
          <>
            {/* Quick Actions for Admin */}
            <Card className="mb-8 bg-gradient-to-r from-primary/5 to-purple-500/5 border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => router.push('/trainings?create=true')}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Training
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/trainings/calendar')}
                    size="lg"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    View Calendar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/trainings')}
                    size="lg"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Manage Trainings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Trainings</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTrainings}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalParticipants}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedTrainings}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalTrainings > 0 ? Math.round((stats.completedTrainings / stats.totalTrainings) * 100) : 0}% completion rate
                  </p>
                </CardContent>
              </Card>
            </div>
            {trainings && trainings.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Training Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    data={[
                      { name: 'Scheduled', value: trainings.filter((t: any) => t.status === 'SCHEDULED').length },
                      { name: 'In Progress', value: trainings.filter((t: any) => t.status === 'IN_PROGRESS').length },
                      { name: 'Completed', value: trainings.filter((t: any) => t.status === 'COMPLETED').length },
                      { name: 'Draft', value: trainings.filter((t: any) => t.status === 'DRAFT').length },
                    ]}
                    type="pie"
                    dataKey="value"
                    nameKey="name"
                  />
                </CardContent>
              </Card>
            )}
          </>
        )}

        {user.role === 'PARTICIPANT' && enrollments && (
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">My Trainings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((training: any, index: number) => {
                const enrollment = training.enrollments?.find((e: any) => e.userId === user.id)
                const isCompleted = training.status === 'COMPLETED' && enrollment?.status === 'COMPLETED'
                
                return (
                  <Card 
                    key={training.id} 
                    className="cursor-pointer hover:shadow-medium transition-smooth group animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => router.push(`/trainings/${training.id}`)}
                  >
                    <CardHeader>
                      <CardTitle>{training.name}</CardTitle>
                      <CardDescription>
                        {new Date(training.startDate).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{training.mode}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            training.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            training.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {training.status}
                          </span>
                        </div>
                        {isCompleted && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/trainings/${training.id}/certificate`)
                            }}
                          >
                            <Award className="h-4 w-4 mr-2" />
                            Get Certificate
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">
              {user.role === 'PARTICIPANT' ? 'All Available Trainings' : 'Recent Trainings'}
            </h3>
            {user.role !== 'PARTICIPANT' && trainings && trainings.length > 6 && (
              <Button variant="outline" onClick={() => router.push('/trainings')}>
                View All
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingTrainings ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Loading trainings...
              </div>
            ) : trainings && trainings.length > 0 ? (
              trainings.slice(0, 6).map((training: any, index: number) => (
              <Card 
                key={training.id} 
                className="cursor-pointer hover:shadow-medium transition-smooth group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => router.push(`/trainings/${training.id}`)}
              >
                <CardHeader>
                  <CardTitle>{training.name}</CardTitle>
                  <CardDescription>
                    {new Date(training.startDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{training.mode}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-smooth ${
                      training.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      training.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      training.status === 'SCHEDULED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {training.status.replace('_', ' ')}
                    </span>
                  </div>
                  {(user?.role === 'ADMIN' || user?.role === 'TRAINER') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/trainings/${training.id}/ai-insights`)
                      }}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Insights
                    </Button>
                  )}
                </CardContent>
              </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No trainings found</p>
                {user?.role === 'ADMIN' && (
                  <Button
                    className="mt-4"
                    onClick={() => router.push('/trainings?create=true')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Training
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

