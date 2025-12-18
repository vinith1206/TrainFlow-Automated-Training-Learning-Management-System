'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toaster'
import { MessageSquare, Send, Edit, Trash2, Reply } from 'lucide-react'
import { format } from 'date-fns'

interface CommentsSectionProps {
  trainingId: string
  currentUserId: string
  currentUserRole: string
}

export default function CommentsSection({ trainingId, currentUserId, currentUserRole }: CommentsSectionProps) {
  const { success, error } = useToast()
  const queryClient = useQueryClient()
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', trainingId],
    queryFn: async () => {
      const response = await api.get(`/comments/training/${trainingId}`)
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post('/comments', {
        trainingId,
        content,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', trainingId] })
      setNewComment('')
      success('Success', 'Comment posted')
    },
    onError: () => {
      error('Error', 'Failed to post comment')
    },
  })

  const replyMutation = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string; content: string }) => {
      const response = await api.post('/comments', {
        trainingId,
        parentId,
        content,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', trainingId] })
      setReplyContent('')
      setReplyingTo(null)
      success('Success', 'Reply posted')
    },
    onError: () => {
      error('Error', 'Failed to post reply')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const response = await api.put(`/comments/${id}`, { content })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', trainingId] })
      setEditingId(null)
      setEditContent('')
      success('Success', 'Comment updated')
    },
    onError: () => {
      error('Error', 'Failed to update comment')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/comments/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', trainingId] })
      success('Success', 'Comment deleted')
    },
    onError: () => {
      error('Error', 'Failed to delete comment')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      createMutation.mutate(newComment)
    }
  }

  const handleReply = (parentId: string) => {
    if (replyContent.trim()) {
      replyMutation.mutate({ parentId, content: replyContent })
    }
  }

  const handleEdit = (id: string, currentContent: string) => {
    setEditingId(id)
    setEditContent(currentContent)
  }

  const handleUpdate = (id: string) => {
    if (editContent.trim()) {
      updateMutation.mutate({ id, content: editContent })
    }
  }

  const CommentItem = ({ comment }: { comment: any }) => (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">
                {comment.user.firstName} {comment.user.lastName}
              </span>
              {comment.user.role && (
                <span className="text-xs text-muted-foreground">
                  ({comment.user.role})
                </span>
              )}
              {comment.isEdited && (
                <span className="text-xs text-muted-foreground italic">
                  (edited)
                </span>
              )}
            </div>
            {editingId === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdate(comment.id)}
                    disabled={updateMutation.isPending}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null)
                      setEditContent('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{format(new Date(comment.createdAt), 'PPpp')}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
              {comment.userId === currentUserId && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => handleEdit(comment.id, comment.content)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-destructive"
                    onClick={() => {
                      if (confirm('Delete this comment?')) {
                        deleteMutation.mutate(comment.id)
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </>
              )}
              {(currentUserRole === 'ADMIN' && comment.userId !== currentUserId) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-destructive"
                  onClick={() => {
                    if (confirm('Delete this comment?')) {
                      deleteMutation.mutate(comment.id)
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        {replyingTo === comment.id && (
          <div className="mt-4 pl-4 border-l-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[80px] mb-2"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleReply(comment.id)}
                disabled={replyMutation.isPending}
              >
                <Send className="h-3 w-3 mr-1" />
                Post Reply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReplyingTo(null)
                  setReplyContent('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-3 pl-4 border-l-2">
            {comment.replies.map((reply: any) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Discussion ({comments?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button type="submit" disabled={createMutation.isPending || !newComment.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Post Comment
          </Button>
        </form>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading comments...</div>
        ) : (
          <div className="space-y-4">
            {comments?.length > 0 ? (
              comments.map((comment: any) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

