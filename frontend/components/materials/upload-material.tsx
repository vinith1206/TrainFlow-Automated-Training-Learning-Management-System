'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Upload, X, File } from 'lucide-react'
import { useToast } from '@/components/ui/toaster'
import { DragDropUpload } from './drag-drop-upload'

interface UploadMaterialProps {
  trainingId: string
  onSuccess?: () => void
}

export function UploadMaterial({ trainingId, onSuccess }: UploadMaterialProps) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PRE_WORK',
    externalLink: '',
    isRequired: true,
  })
  const [file, setFile] = useState<File | null>(null)

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post(`/trainings/${trainingId}/materials`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Material uploaded successfully!')
      queryClient.invalidateQueries({ queryKey: ['training', trainingId] })
      setShowForm(false)
      setFormData({
        name: '',
        description: '',
        type: 'PRE_WORK',
        externalLink: '',
        isRequired: true,
      })
      setFile(null)
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error('Upload failed', error.response?.data?.message || 'Failed to upload material')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = new FormData()
    data.append('name', formData.name)
    data.append('type', formData.type)
    if (formData.description) data.append('description', formData.description)
    if (formData.externalLink) data.append('externalLink', formData.externalLink)
    data.append('isRequired', formData.isRequired.toString())
    if (file) {
      data.append('file', file)
    }
    uploadMutation.mutate(data)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      // Check file size (100MB limit)
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error('File too large', 'Maximum file size is 100MB')
        return
      }
      setFile(selectedFile)
    }
  }

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)}>
        <Upload className="h-4 w-4 mr-2" />
        Upload Material
      </Button>
    )
  }

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Upload New Material</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Material Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="type">Type *</Label>
          <Select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          >
            <option value="PRE_WORK">Pre-work Material</option>
            <option value="POST_TRAINING">Post-training Material</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="file">Upload File</Label>
          <div className="mt-2">
            <DragDropUpload
              onFileSelect={(selectedFile) => {
                if (selectedFile) {
                  setFile(selectedFile)
                } else {
                  setFile(null)
                }
              }}
              acceptedTypes={['.pdf', '.ppt', '.pptx', '.xls', '.xlsx', '.mp4', '.mov', '.avi']}
              maxSize={100}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="externalLink">Or External Link</Label>
          <Input
            id="externalLink"
            type="url"
            value={formData.externalLink}
            onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
            placeholder="https://example.com/resource"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isRequired"
            checked={formData.isRequired}
            onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="isRequired">Required material</Label>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={uploadMutation.isPending || !formData.name}>
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Material'}
          </Button>
          <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

