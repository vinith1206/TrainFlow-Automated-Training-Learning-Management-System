'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toaster'
import { X } from 'lucide-react'

interface EditTrainingModalProps {
  training: any
  users: any[]
  onClose: () => void
}

export function EditTrainingModal({ training, users, onClose }: EditTrainingModalProps) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: training.name || '',
    description: training.description || '',
    trainerId: training.trainerId || '',
    startDate: training.startDate ? new Date(training.startDate).toISOString().slice(0, 16) : '',
    endDate: training.endDate ? new Date(training.endDate).toISOString().slice(0, 16) : '',
    mode: training.mode || 'ONLINE',
    status: training.status || 'DRAFT',
    location: training.location || '',
    meetingLink: training.meetingLink || '',
    maxParticipants: training.maxParticipants || 100,
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch(`/trainings/${training.id}`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Training updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      queryClient.invalidateQueries({ queryKey: ['training', training.id] })
      onClose()
    },
    onError: (error: any) => {
      toast.error('Failed to update training', error.response?.data?.message || 'Please try again')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Edit Training</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Training Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-trainerId">Trainer *</Label>
              <Select
                id="edit-trainerId"
                value={formData.trainerId}
                onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                required
              >
                <option value="">Select Trainer</option>
                {users?.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-startDate">Start Date & Time *</Label>
              <Input
                id="edit-startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-endDate">End Date & Time *</Label>
              <Input
                id="edit-endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-mode">Mode *</Label>
              <Select
                id="edit-mode"
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                required
              >
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="HYBRID">Hybrid</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-status">Status *</Label>
              <Select
                id="edit-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </div>
          </div>

          {formData.mode !== 'ONLINE' && (
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Training location"
              />
            </div>
          )}

          {formData.mode !== 'OFFLINE' && (
            <div>
              <Label htmlFor="edit-meetingLink">Meeting Link</Label>
              <Input
                id="edit-meetingLink"
                type="url"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/..."
              />
            </div>
          )}

          <div>
            <Label htmlFor="edit-maxParticipants">Max Participants</Label>
            <Input
              id="edit-maxParticipants"
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
              min={1}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Training'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

