'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toaster'
import Link from 'next/link'
import { BookOpen, Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import { Logo } from '@/components/layout/logo'

export default function LoginPage() {
  const router = useRouter()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:mutationFn-entry',message:'Login mutation started',data:{email:data.email,hasPassword:!!data.password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.log('[LOGIN DEBUG] Mutation started', { email: data.email, apiBaseURL: api.defaults.baseURL })
      try {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:mutationFn-before-api',message:'Before API call',data:{email:data.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.log('[LOGIN DEBUG] Making API call to:', api.defaults.baseURL + '/auth/login')
        const response = await api.post('/auth/login', data)
        console.log('[LOGIN DEBUG] API response received', { status: response.status, hasData: !!response.data, dataKeys: Object.keys(response.data || {}) })
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:mutationFn-after-api',message:'API call successful',data:{hasAccessToken:!!response.data.access_token,hasUser:!!response.data.user,requires2FA:!!response.data.requires2FA},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        console.log('[LOGIN DEBUG] Login response:', response.data)
        console.log('[LOGIN DEBUG] Response structure:', { 
          hasAccessToken: !!response.data.access_token, 
          hasUser: !!response.data.user,
          requires2FA: !!response.data.requires2FA,
          allKeys: Object.keys(response.data || {})
        })
        return response.data
      } catch (error: any) {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:mutationFn-catch',message:'API call failed',data:{message:error.message,status:error.response?.status,responseData:error.response?.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.error('[LOGIN DEBUG] API call failed:', error)
        console.error('[LOGIN DEBUG] Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          requestURL: error.config?.url,
          requestBaseURL: error.config?.baseURL
        })
        throw error
      }
    },
    onSuccess: (data) => {
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:onSuccess-entry',message:'onSuccess handler called',data:{hasAccessToken:!!data.access_token,hasUser:!!data.user,requires2FA:!!data.requires2FA},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.log('[LOGIN DEBUG] onSuccess called with data:', data)
      console.log('[LOGIN DEBUG] Data structure:', {
        hasAccessToken: !!data.access_token,
        hasUser: !!data.user,
        requires2FA: !!data.requires2FA,
        allKeys: Object.keys(data || {})
      })
      
      // Check if 2FA is required
      if (data.requires2FA || data.requiresTwoFactor) {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:onSuccess-2fa-check',message:'2FA required, returning early',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        toast.error('Two-Factor Authentication Required', 'Please enable 2FA in your profile settings')
        return
      }
      
      // Check if we have access_token
      if (!data.access_token) {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:onSuccess-no-token',message:'No access_token in response',data:{responseKeys:Object.keys(data)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        console.error('No access_token in response:', data)
        toast.error('Login failed', 'Invalid response from server')
        return
      }
      
      if (!data.user) {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:onSuccess-no-user',message:'No user data in response',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        console.error('No user data in response:', data)
        toast.error('Login failed', 'Invalid user data from server')
        return
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:onSuccess-before-storage',message:'Before storing token',data:{tokenLength:data.access_token.length,userId:data.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      try {
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:onSuccess-after-storage',message:'Token stored successfully',data:{storedToken:!!localStorage.getItem('token'),storedUser:!!localStorage.getItem('user')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      } catch (storageError: any) {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:onSuccess-storage-error',message:'localStorage.setItem failed',data:{error:storageError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        console.error('Storage error:', storageError)
        toast.error('Login failed', 'Failed to save login information')
        return
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:onSuccess-before-navigation',message:'Before navigation to dashboard',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      console.log('Login successful, redirecting to dashboard')
      toast.success('Login successful!', 'Welcome to TrainFlow')
      router.push('/dashboard')
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:onSuccess-after-navigation',message:'After router.push call',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    },
    onError: (error: any) => {
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:onError',message:'onError handler called',data:{message:error.message,status:error.response?.status,responseData:error.response?.data,hasResponse:!!error.response},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const errorMessage = error.response?.data?.message || error.message || 'Invalid credentials'
      console.error('Login mutation error:', error)
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage
      })
      toast.error('Login failed', errorMessage)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[LOGIN DEBUG] Form submitted', { email, hasPassword: !!password })
    setIsLoading(true)
    loginMutation.mutate(
      { email, password },
      {
        onSettled: () => {
          console.log('[LOGIN DEBUG] Mutation settled')
          setIsLoading(false)
        },
      }
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <Logo size="lg" showTagline={true} />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-lg">Sign in to your account</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-2 shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 border-2 focus:border-primary transition-colors"
                    disabled={loginMutation.isPending}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 h-12 border-2 focus:border-primary transition-colors"
                    disabled={loginMutation.isPending}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loginMutation.isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1 group"
                >
                  Forgot your password?
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loginMutation.isPending || isLoading}
              >
                {loginMutation.isPending || isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-dashed">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Demo Credentials
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span className="font-medium">Admin:</span>
                  <span className="font-mono">admin@tmds.com / admin123</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Trainer:</span>
                  <span className="font-mono">trainer@tmds.com / trainer123</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Participant:</span>
                  <span className="font-mono">participant@tmds.com / participant123</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Contact Administrator
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center animate-fade-in">
          <p className="text-xs text-muted-foreground">
            © 2025 TrainFlow – Automated Training & Learning Management System
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
