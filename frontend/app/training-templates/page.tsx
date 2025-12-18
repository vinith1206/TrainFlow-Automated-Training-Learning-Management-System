'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toaster'
import { Plus, Search, FileText, Copy, Edit, Trash2, Star } from 'lucide-react'
import { format } from 'date-fns'

export default function TrainingTemplatesPage() {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  const { data: templates, isLoading } = useQuery({
    queryKey: ['training-templates', searchTerm],
    queryFn: async () => {
      const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''
      const response = await api.get(`/training-templates${params}`)
      return response.data
    },
  })

  const createFromTemplateMutation = useMutation({
    mutationFn: async ({ templateId, overrides }: { templateId: string; overrides?: any }) => {
      const response = await api.post(`/training-templates/${templateId}/create-training`, overrides || {})
      return response.data
    },
    onSuccess: (data) => {
      success('Training created from template', 'Redirecting to training page...')
      router.push(`/trainings/${data.id}`)
    },
    onError: () => {
      showError('Failed to create training from template', 'Please try again')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/training-templates/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-templates'] })
      success('Template deleted', 'The template has been removed')
    },
    onError: () => {
      showError('Failed to delete template', 'Please try again')
    },
  })

  const handleCreateFromTemplate = (templateId: string) => {
    createFromTemplateMutation.mutate({ templateId })
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Templates</h1>
          <p className="text-muted-foreground mt-2">
            Save and reuse training configurations
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Save Current Training as Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates?.map((template: any) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.category && (
                          <Badge variant="outline" className="mt-2">
                            {template.category}
                          </Badge>
                        )}
                      </div>
                      {template.isPublic && (
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    {template.description && (
                      <CardDescription className="mt-2">
                        {template.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {template.tags.map((tag: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground">
                        <div>Used {template.usageCount} times</div>
                        <div>Created {format(new Date(template.createdAt), 'PP')}</div>
                        {template.createdBy && (
                          <div>By {template.createdBy.firstName} {template.createdBy.lastName}</div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleCreateFromTemplate(template.id)}
                          disabled={createFromTemplateMutation.isPending}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (confirm('Delete this template?')) {
                              deleteMutation.mutate(template.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {templates?.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No templates found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

