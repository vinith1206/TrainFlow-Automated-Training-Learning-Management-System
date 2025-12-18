'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toaster'
import { CheckSquare, Square, Trash2, Edit, Users } from 'lucide-react'

interface BulkOperationsProps {
  selectedIds: string[]
  onClearSelection: () => void
}

export function BulkOperations({ selectedIds, onClearSelection }: BulkOperationsProps) {
  const { success, error: showError } = useToast()
  const queryClient = useQueryClient()
  const [action, setAction] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [mode, setMode] = useState<string>('')

  const bulkMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/trainings/bulk', {
        trainingIds: selectedIds,
        action: data.action,
        data: data.data,
      })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      if (data.failedCount > 0) {
        showError('Bulk operation completed with errors', `${data.successCount} succeeded, ${data.failedCount} failed`)
      } else {
        success('Bulk operation completed', `${data.successCount} training(s) updated successfully`)
      }
      onClearSelection()
      setAction('')
      setStatus('')
      setMode('')
    },
    onError: () => {
      showError('Bulk operation failed', 'Please try again')
    },
  })

  const handleExecute = () => {
    if (!action) {
      showError('Please select an action', 'Choose an action to perform on selected trainings')
      return
    }

    const data: any = {}
    if (action === 'UPDATE_STATUS' && status) {
      data.status = status
    } else if (action === 'UPDATE_MODE' && mode) {
      data.mode = mode
    }

    bulkMutation.mutate({ action, data })
  }

  if (selectedIds.length === 0) return null

  return (
    <div className="border rounded-lg p-4 bg-muted/50 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          <span className="font-semibold">{selectedIds.length} training(s) selected</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Clear Selection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select 
          value={action} 
          onChange={(e) => setAction(e.target.value)}
        >
          <option value="">Select action</option>
          <option value="UPDATE_STATUS">Update Status</option>
          <option value="UPDATE_MODE">Update Mode</option>
          <option value="DELETE">Delete</option>
        </Select>

        {action === 'UPDATE_STATUS' && (
          <Select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Select status</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        )}

        {action === 'UPDATE_MODE' && (
          <Select 
            value={mode} 
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="">Select mode</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="HYBRID">Hybrid</option>
          </Select>
        )}

        <Button
          onClick={handleExecute}
          disabled={bulkMutation.isPending || !action || (action === 'UPDATE_STATUS' && !status) || (action === 'UPDATE_MODE' && !mode)}
          variant={action === 'DELETE' ? 'destructive' : 'default'}
        >
          {bulkMutation.isPending ? 'Processing...' : 'Execute'}
        </Button>
      </div>
    </div>
  )
}

