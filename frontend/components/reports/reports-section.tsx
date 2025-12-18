'use client'

import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet } from 'lucide-react'
import { useToast } from '@/components/ui/toaster'

interface ReportsSectionProps {
  trainingId: string
}

export function ReportsSection({ trainingId }: ReportsSectionProps) {
  const toast = useToast()

  const attendanceReportMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get(`/reports/attendance/${trainingId}`, {
        responseType: 'blob',
      })
      return response.data
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance-report-${trainingId}-${Date.now()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Report generated', 'Attendance report downloaded successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to generate report', error.response?.data?.message)
    },
  })

  const completionReportMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get(`/reports/completion/${trainingId}`, {
        responseType: 'blob',
      })
      return response.data
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `completion-report-${trainingId}-${Date.now()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Report generated', 'Completion report downloaded successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to generate report', error.response?.data?.message)
    },
  })

  const feedbackReportMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get(`/reports/feedback/${trainingId}`, {
        responseType: 'blob',
      })
      return response.data
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `feedback-report-${trainingId}-${Date.now()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Report generated', 'Feedback report downloaded successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to generate report', error.response?.data?.message)
    },
  })

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Generate Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={() => attendanceReportMutation.mutate()}
          disabled={attendanceReportMutation.isPending}
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <FileSpreadsheet className="h-6 w-6" />
          <span>Attendance Report</span>
          {attendanceReportMutation.isPending && (
            <span className="text-xs text-muted-foreground">Generating...</span>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => completionReportMutation.mutate()}
          disabled={completionReportMutation.isPending}
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <FileSpreadsheet className="h-6 w-6" />
          <span>Completion Report</span>
          {completionReportMutation.isPending && (
            <span className="text-xs text-muted-foreground">Generating...</span>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => feedbackReportMutation.mutate()}
          disabled={feedbackReportMutation.isPending}
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <FileSpreadsheet className="h-6 w-6" />
          <span>Feedback Report</span>
          {feedbackReportMutation.isPending && (
            <span className="text-xs text-muted-foreground">Generating...</span>
          )}
        </Button>
      </div>
    </div>
  )
}

