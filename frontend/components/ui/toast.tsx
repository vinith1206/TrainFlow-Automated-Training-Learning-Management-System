'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning'
  duration?: number
  onClose?: () => void
}

const Toast: React.FC<ToastProps> = ({ id, title, description, variant = 'default', onClose }) => {
  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5',
        variant === 'success' && 'bg-green-50 border border-green-200',
        variant === 'error' && 'bg-red-50 border border-red-200',
        variant === 'warning' && 'bg-yellow-50 border border-yellow-200',
        variant === 'default' && 'bg-white border border-gray-200'
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            {title && (
              <p
                className={cn(
                  'text-sm font-medium',
                  variant === 'success' && 'text-green-800',
                  variant === 'error' && 'text-red-800',
                  variant === 'warning' && 'text-yellow-800',
                  variant === 'default' && 'text-gray-900'
                )}
              >
                {title}
              </p>
            )}
            {description && (
              <p
                className={cn(
                  'mt-1 text-sm',
                  variant === 'success' && 'text-green-700',
                  variant === 'error' && 'text-red-700',
                  variant === 'warning' && 'text-yellow-700',
                  variant === 'default' && 'text-gray-500'
                )}
              >
                {description}
              </p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={cn(
                'ml-4 inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                variant === 'success' && 'text-green-500 hover:bg-green-100 focus:ring-green-600',
                variant === 'error' && 'text-red-500 hover:bg-red-100 focus:ring-red-600',
                variant === 'warning' && 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600',
                variant === 'default' && 'text-gray-400 hover:bg-gray-100 focus:ring-gray-500'
              )}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Toast

