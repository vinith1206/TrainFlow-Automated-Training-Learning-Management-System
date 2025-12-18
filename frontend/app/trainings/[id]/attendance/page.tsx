'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function AttendancePage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const trainingId = params.id as string

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', trainingId],
    queryFn: async () => {
      const response = await api.get(`/trainings/${trainingId}/attendance`)
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

  const markAttendanceMutation = useMutation({
    mutationFn: async (data: { userId: string; status: string }) => {
      const response = await api.post(`/trainings/${trainingId}/attendance`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', trainingId] })
    },
  })

  const selfCheckInMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/trainings/${trainingId}/attendance/check-in`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', trainingId] })
    },
  })

  const handleMarkAttendance = (userId: string, status: string) => {
    markAttendanceMutation.mutate({ userId, status })
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
  const isTrainer = user?.role === 'TRAINER' || user?.role === 'ADMIN'
  const isParticipant = user?.role === 'PARTICIPANT'
  const userAttendance = attendance?.records?.find((a: any) => a.userId === user?.id)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Attendance - {training?.name}</h1>
          {attendance?.stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{attendance.stats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Present</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{attendance.stats.present}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Absent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{attendance.stats.absent}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{attendance.stats.attendanceRate.toFixed(1)}%</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {isParticipant && !userAttendance && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Self Check-In</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => selfCheckInMutation.mutate()}
                disabled={selfCheckInMutation.isPending}
                className="w-full"
              >
                {selfCheckInMutation.isPending ? 'Checking in...' : 'Check In Now'}
              </Button>
            </CardContent>
          </Card>
        )}

        {isParticipant && userAttendance && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  userAttendance.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                  userAttendance.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {userAttendance.status === 'PRESENT' && <CheckCircle className="h-6 w-6" />}
                  {userAttendance.status === 'LATE' && <Clock className="h-6 w-6" />}
                  {userAttendance.status === 'ABSENT' && <XCircle className="h-6 w-6" />}
                </div>
                <div>
                  <p className="font-medium">Status: {userAttendance.status}</p>
                  {userAttendance.checkInTime && (
                    <p className="text-sm text-muted-foreground">
                      Checked in: {formatDateTime(userAttendance.checkInTime)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {training?.enrollments?.map((enrollment: any) => {
                const record = attendance?.records?.find((a: any) => a.userId === enrollment.userId)
                return (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">
                          {enrollment.user.firstName} {enrollment.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{enrollment.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {record ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                            record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {record.status}
                          </span>
                          {record.checkInTime && (
                            <span className="text-sm text-muted-foreground">
                              {formatDateTime(record.checkInTime)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not marked</span>
                      )}
                      {isTrainer && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAttendance(enrollment.userId, 'PRESENT')}
                            disabled={markAttendanceMutation.isPending}
                          >
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAttendance(enrollment.userId, 'ABSENT')}
                            disabled={markAttendanceMutation.isPending}
                          >
                            Absent
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

