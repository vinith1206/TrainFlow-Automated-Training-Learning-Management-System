'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toaster'
import { History, RotateCcw, Download, FileText } from 'lucide-react'
import { format } from 'date-fns'

interface MaterialVersionsProps {
  materialId: string
  trainingId: string
  currentUserId: string
}

export function MaterialVersions({ materialId, trainingId, currentUserId }: MaterialVersionsProps) {
  const { success, error } = useToast()
  const queryClient = useQueryClient()

  const { data: versions, isLoading } = useQuery({
    queryKey: ['material-versions', materialId],
    queryFn: async () => {
      const response = await api.get(`/trainings/${trainingId}/materials/${materialId}/versions`)
      return response.data
    },
    enabled: !!materialId && !!trainingId,
  })

  const rollbackMutation = useMutation({
    mutationFn: async (version: number) => {
      const response = await api.post(`/trainings/materials/${materialId}/rollback`, { version })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-versions', materialId] })
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      success('Success', 'Material rolled back to selected version')
    },
    onError: () => {
      error('Error', 'Failed to rollback material')
    },
  })

  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground">Loading versions...</div>
  }

  if (!versions || versions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No version history available</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Version History ({versions.length})
        </CardTitle>
        <CardDescription>View and restore previous versions of this material</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {versions.map((version: any) => (
            <div
              key={version.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">v{version.version}</Badge>
                    {version.version === versions[0]?.version && (
                      <Badge variant="default">Current</Badge>
                    )}
                  </div>
                  <h4 className="font-semibold mb-1">{version.name}</h4>
                  {version.description && (
                    <p className="text-sm text-muted-foreground mb-2">{version.description}</p>
                  )}
                  {version.changeNotes && (
                    <p className="text-xs text-muted-foreground italic mb-2">
                      {version.changeNotes}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      Created: {format(new Date(version.createdAt), 'PPpp')}
                    </span>
                    {version.createdBy && (
                      <span>
                        By: {version.createdBy.firstName} {version.createdBy.lastName}
                      </span>
                    )}
                    {version.fileSize && (
                      <span>Size: {(version.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {version.fileUrl && (
                    <a 
                      href={version.fileUrl} 
                      download
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 transition-smooth active:scale-95"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </a>
                  )}
                  {version.version !== versions[0]?.version && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Rollback to version ${version.version}?`)) {
                          rollbackMutation.mutate(version.version)
                        }
                      }}
                      disabled={rollbackMutation.isPending}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Rollback
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

