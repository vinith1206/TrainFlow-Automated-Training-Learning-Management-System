'use client'

import { useRouter } from 'next/navigation'

interface LogoProps {
  showTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ showTagline = false, size = 'md', className = '' }: LogoProps) {
  const router = useRouter()
  
  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-xl', tagline: 'text-xs' },
    md: { icon: 'w-12 h-12', text: 'text-2xl', tagline: 'text-sm' },
    lg: { icon: 'w-16 h-16', text: 'text-3xl', tagline: 'text-base' },
  }

  const currentSize = sizeClasses[size]

  return (
    <div 
      className={`flex items-center gap-3 cursor-pointer ${className}`}
      onClick={() => router.push('/dashboard')}
    >
      {/* Book Logo - Rectangular shape */}
      <div className={`${currentSize.icon} relative flex-shrink-0`}>
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <defs>
            {/* Gradient for golden elements */}
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
            </linearGradient>
            {/* Glow effect for pages */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Rectangular Book Shape */}
          {/* Left side - Vibrant Light Blue/Cyan with horizontal lines */}
          <rect x="8" y="16" width="24" height="32" fill="#06b6d4" rx="2" filter="url(#glow)" />
          
          {/* Horizontal lines on left side (pages) */}
          <line x1="10" y1="22" x2="30" y2="22" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
          <line x1="10" y1="28" x2="30" y2="28" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
          <line x1="10" y1="34" x2="30" y2="34" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
          <line x1="10" y1="40" x2="30" y2="40" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
          <line x1="10" y1="46" x2="30" y2="46" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
          
          {/* Right side - Darker Blue */}
          <rect x="32" y="16" width="24" height="32" fill="#1e40af" rx="2" />
          
          {/* Two Golden V-shaped elements on top of darker blue section */}
          {/* Left V-shape */}
          <path
            d="M 36 20 L 40 16 L 44 20 Z"
            fill="url(#goldGradient)"
            opacity="0.95"
          />
          {/* Right V-shape */}
          <path
            d="M 44 20 L 48 16 L 52 20 Z"
            fill="url(#goldGradient)"
            opacity="0.95"
          />
        </svg>
      </div>

      {/* Text - Positioned to the right of logo */}
      <div className="flex flex-col">
        <div className={`${currentSize.text} font-bold leading-tight`}>
          <span 
            className="text-blue-400 dark:text-blue-300"
            style={{
              textShadow: '0 0 10px rgba(96, 165, 250, 0.5), 0 0 20px rgba(96, 165, 250, 0.3)',
            }}
          >
            Train
          </span>
          <span 
            className="text-cyan-400 dark:text-cyan-300"
            style={{
              textShadow: '0 0 10px rgba(34, 211, 238, 0.5), 0 0 20px rgba(34, 211, 238, 0.3)',
            }}
          >
            Flow
          </span>
        </div>
        {showTagline && (
          <p className={`${currentSize.tagline} text-blue-400 dark:text-blue-500 font-normal mt-1`}>
            Automated Training & Learning Management System
          </p>
        )}
      </div>
    </div>
  )
}

