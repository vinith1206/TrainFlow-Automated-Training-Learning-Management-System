'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SimpleChart } from '@/components/charts/simple-chart'
import { TrendingUp, Users, BookOpen, Award, Clock } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: trainings } = useQuery({
    queryKey: ['trainings'],
    queryFn: async () => {
      const response = await api.get('/trainings')
      return response.data
    },
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users')
      return response.data
    },
  })

  if (!trainings || !users) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Calculate analytics
  const totalTrainings = trainings.length
  const completedTrainings = trainings.filter((t: any) => t.status === 'COMPLETED').length
  const inProgressTrainings = trainings.filter((t: any) => t.status === 'IN_PROGRESS').length
  const scheduledTrainings = trainings.filter((t: any) => t.status === 'SCHEDULED').length

  const totalParticipants = users.filter((u: any) => u.role === 'PARTICIPANT').length
  const totalTrainers = users.filter((u: any) => u.role === 'TRAINER').length

  const totalEnrollments = trainings.reduce((sum: number, t: any) => sum + (t._count?.enrollments || 0), 0)
  const avgEnrollmentsPerTraining = totalTrainings > 0 ? (totalEnrollments / totalTrainings).toFixed(1) : 0

  // Monthly training trend
  const monthlyData = trainings.reduce((acc: any, t: any) => {
    const month = new Date(t.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  const monthlyChartData = Object.entries(monthlyData).map(([name, value]) => ({
    name,
    value,
  }))

  // Status distribution
  const statusData = [
    { name: 'Completed', value: completedTrainings },
    { name: 'In Progress', value: inProgressTrainings },
    { name: 'Scheduled', value: scheduledTrainings },
    { name: 'Draft', value: trainings.filter((t: any) => t.status === 'DRAFT').length },
  ]

  // Mode distribution
  const modeData = trainings.reduce((acc: any, t: any) => {
    acc[t.mode] = (acc[t.mode] || 0) + 1
    return acc
  }, {})

  const modeChartData = Object.entries(modeData).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Advanced Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into training performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trainings</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrainings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedTrainings} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalParticipants}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalTrainers} trainers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrollments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg {avgEnrollmentsPerTraining} per training
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalTrainings > 0 ? Math.round((completedTrainings / totalTrainings) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedTrainings} of {totalTrainings}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Training Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleChart
                data={statusData}
                type="pie"
                dataKey="value"
                nameKey="name"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training Mode Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleChart
                data={modeChartData}
                type="bar"
                dataKey="value"
                nameKey="name"
              />
            </CardContent>
          </Card>
        </div>

        {monthlyChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Training Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleChart
                data={monthlyChartData}
                type="line"
                dataKey="value"
                nameKey="name"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

