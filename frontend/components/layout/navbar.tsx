'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { User, LogOut, Moon, Sun, Calendar as CalendarIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { NotificationsDropdown } from './notifications-dropdown'
import { Logo } from './logo'

export function Navbar() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (!mounted) return null

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo size="md" />
          <nav className="hidden md:flex gap-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => router.push('/trainings')}>
              Trainings
            </Button>
            <Button variant="ghost" onClick={() => router.push('/trainings/calendar')}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            {user?.role === 'ADMIN' && (
              <>
                <Button variant="ghost" onClick={() => router.push('/admin/users')}>
                  Users
                </Button>
                <Button variant="ghost" onClick={() => router.push('/dashboard/analytics')}>
                  Analytics
                </Button>
                <Button variant="ghost" onClick={() => router.push('/audit-logs')}>
                  Audit Logs
                </Button>
                <Button variant="ghost" onClick={() => router.push('/training-templates')}>
                  Templates
                </Button>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <NotificationsDropdown />
          {user && (
            <Button
              variant="ghost"
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2"
            >
              <User className="h-5 w-5" />
              <span className="hidden md:inline">{user.firstName} {user.lastName}</span>
              <span className="hidden md:inline text-sm text-muted-foreground">({user.role})</span>
            </Button>
          )}
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}

