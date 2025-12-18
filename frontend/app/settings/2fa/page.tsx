'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toaster'
import { Shield, CheckCircle, XCircle, QrCode } from 'lucide-react'
import Image from 'next/image'

export default function TwoFactorPage() {
  const { success, error: showError } = useToast()
  const [verificationCode, setVerificationCode] = useState('')
  const [step, setStep] = useState<'setup' | 'verify' | 'enabled'>('setup')

  const { data: setupData, isLoading: isLoadingSetup } = useQuery({
    queryKey: ['2fa-setup'],
    queryFn: async () => {
      const response = await api.get('/auth/2fa/setup')
      return response.data
    },
    enabled: step === 'setup',
  })

  const enableMutation = useMutation({
    mutationFn: async (data: { secret: string; token: string }) => {
      const response = await api.post('/auth/2fa/enable', data)
      return response.data
    },
    onSuccess: () => {
      success('Two-factor authentication enabled', 'Your account is now protected')
      setStep('enabled')
    },
    onError: () => {
      showError('Invalid verification code', 'Please try again')
    },
  })

  const disableMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await api.post('/auth/2fa/disable', { password })
      return response.data
    },
    onSuccess: () => {
      success('Two-factor authentication disabled', '2FA has been removed from your account')
      setStep('setup')
    },
    onError: () => {
      showError('Failed to disable 2FA', 'Please check your password and try again')
    },
  })

  const handleVerify = () => {
    if (!setupData || !verificationCode) {
      showError('Please enter verification code', 'Enter the 6-digit code from your authenticator app')
      return
    }

    enableMutation.mutate({
      secret: setupData.secret,
      token: verificationCode,
    })
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Two-Factor Authentication</h1>
        <p className="text-muted-foreground mt-2">
          Add an extra layer of security to your account
        </p>
      </div>

      {step === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Setup 2FA
            </CardTitle>
            <CardDescription>
              Scan the QR code with your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingSetup ? (
              <div className="text-center py-8">Loading...</div>
            ) : setupData ? (
              <>
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg">
                    <img
                      src={setupData.qrCodeUrl}
                      alt="QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Or enter this code manually:</p>
                  <div className="bg-muted p-3 rounded font-mono text-sm break-all">
                    {setupData.manualEntryKey}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Enter verification code from your app:
                  </label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <Button
                  onClick={handleVerify}
                  disabled={enableMutation.isPending || !verificationCode}
                  className="w-full"
                >
                  {enableMutation.isPending ? 'Verifying...' : 'Verify & Enable'}
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Failed to load setup data
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'enabled' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              2FA Enabled
            </CardTitle>
            <CardDescription>
              Your account is now protected with two-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => {
                const password = prompt('Enter your password to disable 2FA:')
                if (password) {
                  disableMutation.mutate(password)
                }
              }}
              disabled={disableMutation.isPending}
            >
              {disableMutation.isPending ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

