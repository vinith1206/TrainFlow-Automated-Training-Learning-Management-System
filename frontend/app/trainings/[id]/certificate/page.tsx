'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, CheckCircle, XCircle, QrCode } from 'lucide-react'
import { useToast } from '@/components/ui/toaster'

export default function CertificatePage() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const trainingId = params.id as string

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/certificates/generate/${trainingId}`)
      return response.data
    },
    onSuccess: (data) => {
      toast.success('Certificate generated!', 'Download your certificate below')
      // Trigger download
      window.open(data.filePath, '_blank')
    },
    onError: (error: any) => {
      toast.error('Certificate generation failed', error.response?.data?.message || 'You may not be eligible for a certificate')
    },
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-6 w-6" />
                Training Certificate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <div className="mb-4">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Certificate of Completion</h2>
                <p className="text-muted-foreground">
                  Generate your official training certificate with QR code verification
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Certificate Requirements:</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Training must be completed
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Attendance rate must be ≥ 75%
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Enrollment status must be completed
                  </li>
                </ul>
              </div>

              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  size="lg"
                  className="w-full"
                >
                  {generateMutation.isPending ? (
                    'Generating Certificate...'
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Generate & Download Certificate
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your certificate will include a unique QR code for verification
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-2">Certificate Features:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Official PDF format</li>
                  <li>✓ QR code for instant verification</li>
                  <li>✓ Unique certificate ID</li>
                  <li>✓ Trainer signature</li>
                  <li>✓ Completion date</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

