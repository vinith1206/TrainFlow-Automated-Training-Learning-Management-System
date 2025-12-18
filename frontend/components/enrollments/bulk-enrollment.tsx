'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'
import { Upload, FileSpreadsheet, X } from 'lucide-react'
import { DragDropUpload } from '@/components/materials/drag-drop-upload'

interface BulkEnrollmentProps {
  trainingId: string
  onSuccess?: () => void
}

export function BulkEnrollment({ trainingId, onSuccess }: BulkEnrollmentProps) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post(`/trainings/${trainingId}/enrollments/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: (data) => {
      toast.success('Bulk enrollment successful!', `Enrolled ${data.length || 0} participants`)
      queryClient.invalidateQueries({ queryKey: ['training', trainingId] })
      setShowForm(false)
      setFile(null)
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error('Bulk enrollment failed', error.response?.data?.message || 'Please check your Excel file format')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('No file selected', 'Please select an Excel file')
      return
    }
    uploadMutation.mutate(file)
  }

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} variant="outline">
        <Upload className="h-4 w-4 mr-2" />
        Bulk Enroll (Excel)
      </Button>
    )
  }

  return (
    <div className="border rounded-lg p-4 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Bulk Enrollment</h3>
          <p className="text-sm text-muted-foreground">
            Upload an Excel file with participant emails (one per row, first column)
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => {
          setShowForm(false)
          setFile(null)
        }}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Excel File Format</label>
          <div className="bg-muted p-3 rounded text-sm mb-4">
            <p className="font-semibold mb-1">Required format:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>First row should be header (Email)</li>
              <li>Each subsequent row should contain one email address</li>
              <li>File must be .xlsx format</li>
            </ul>
            <div className="mt-3 p-2 bg-background rounded">
              <p className="font-mono text-xs">Email</p>
              <p className="font-mono text-xs">user1@example.com</p>
              <p className="font-mono text-xs">user2@example.com</p>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Upload Excel File</label>
          <DragDropUpload
            onFileSelect={(selectedFile) => {
              if (selectedFile) {
                // Validate it's an Excel file
                const ext = selectedFile.name.split('.').pop()?.toLowerCase()
                if (ext !== 'xlsx' && ext !== 'xls') {
                  toast.error('Invalid file type', 'Please upload an Excel file (.xlsx or .xls)')
                  return
                }
                setFile(selectedFile)
              } else {
                setFile(null)
              }
            }}
            acceptedTypes={['.xlsx', '.xls']}
            maxSize={10}
          />
        </div>

        {file && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!file || uploadMutation.isPending}
            className="flex-1"
          >
            {uploadMutation.isPending ? (
              'Enrolling...'
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Enroll
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowForm(false)
              setFile(null)
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

