'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Calendar, Users, BookOpen, Edit, Trash2, MoreVertical, FileText, CheckSquare, Square } from 'lucide-react'
import { BulkOperations } from '@/components/trainings/bulk-operations'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/toaster'
import { EditTrainingModal } from '@/components/trainings/edit-training-modal'

export default function TrainingsPage() {
  const router = useRouter()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingTraining, setEditingTraining] = useState<any>(null)
  const [selectedTrainings, setSelectedTrainings] = useState<string[]>([])
  
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  const user = userStr ? JSON.parse(userStr) : null
  const isAdmin = user?.role === 'ADMIN'
  
  // Check if we should auto-open the create form (from dashboard quick action)
  const [showCreateForm, setShowCreateForm] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('create') === 'true'
    }
    return false
  })
  
  // Clear the query parameter after opening
  useEffect(() => {
    if (showCreateForm && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('create') === 'true') {
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [showCreateForm])

  const { data: trainingsResponse, isLoading } = useQuery({
    queryKey: ['trainings', { search: searchTerm, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      // Request more items for dashboard (no pagination limit)
      params.append('limit', '100')
      const response = await api.get(`/trainings?${params.toString()}`)
      return response.data
    },
  })

  // Handle paginated response
  const trainings = trainingsResponse?.data || trainingsResponse || []

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users?role=TRAINER')
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/trainings', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Training created successfully!')
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      setShowCreateForm(false)
    },
    onError: (error: any) => {
      toast.error('Failed to create training', error.response?.data?.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/trainings/${id}`)
    },
    onSuccess: () => {
      toast.success('Training deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
    },
    onError: (error: any) => {
      toast.error('Failed to delete training', error.response?.data?.message)
    },
  })

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      startDate: new Date(formData.get('startDate') as string).toISOString(),
      endDate: new Date(formData.get('endDate') as string).toISOString(),
      mode: formData.get('mode'),
      location: formData.get('location') || undefined,
      meetingLink: formData.get('meetingLink') || undefined,
      trainerId: formData.get('trainerId') || undefined,
      maxParticipants: formData.get('maxParticipants') ? parseInt(formData.get('maxParticipants') as string) : undefined,
    }
    createMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Trainings</h1>
            <p className="text-muted-foreground mt-2">Manage all training programs</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/training-templates')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Button>
          {isAdmin && (
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              {showCreateForm ? 'Cancel' : 'Create New Training'}
            </Button>
          )}
          {user?.role === 'TRAINER' && !isAdmin && (
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Training
            </Button>
          )}
          </div>
        </div>

      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Training</CardTitle>
            <CardDescription>Fill in the details to create a new training program</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Training Name *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="trainerId">Trainer</Label>
                  <Select id="trainerId" name="trainerId">
                    <option value="">Select Trainer</option>
                    {users?.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input id="startDate" name="startDate" type="datetime-local" required />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input id="endDate" name="endDate" type="datetime-local" required />
                </div>
                <div>
                  <Label htmlFor="mode">Mode *</Label>
                  <Select id="mode" name="mode" required>
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="HYBRID">Hybrid</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input id="maxParticipants" name="maxParticipants" type="number" min="1" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" placeholder="For offline/hybrid trainings" />
                </div>
                <div>
                  <Label htmlFor="meetingLink">Meeting Link</Label>
                  <Input id="meetingLink" name="meetingLink" placeholder="For online/hybrid trainings" />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Training'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search trainings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainings?.map((training: any) => (
              <Card
                key={training.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => !selectedTrainings.length && router.push(`/trainings/${training.id}`)}
                >
                  {isAdmin && (
                    <div className="flex items-center gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setSelectedTrainings(prev =>
                            prev.includes(training.id)
                              ? prev.filter(id => id !== training.id)
                              : [...prev, training.id]
                          )
                        }}
                      >
                        {selectedTrainings.includes(training.id) ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                  <CardTitle className="line-clamp-2">{training.name}</CardTitle>
                  <CardDescription>
                    {training.trainer?.firstName} {training.trainer?.lastName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(training.startDate)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {training._count?.enrollments || 0} participants
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs ${
                        training.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        training.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        training.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {training.status}
                      </span>
                      <span className="text-sm text-muted-foreground">{training.mode}</span>
                    </div>
                    {(isAdmin || user?.role === 'TRAINER') && (
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingTraining(training)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(training.id, training.name)
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                            Delete
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {trainings?.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No trainings found</p>
        </div>
      )}

      {isAdmin && selectedTrainings.length > 0 && (
        <BulkOperations
          selectedIds={selectedTrainings}
          onClearSelection={() => {
            setSelectedTrainings([])
            queryClient.invalidateQueries({ queryKey: ['trainings'] })
          }}
        />
      )}

      {editingTraining && (
        <EditTrainingModal
          training={editingTraining}
          users={users || []}
          onClose={() => setEditingTraining(null)}
        />
      )}
      </div>
    </div>
  )
}

