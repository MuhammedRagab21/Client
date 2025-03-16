"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle2,
  Download,
  ChevronRight,
  Calendar,
  Clock,
  BookOpen,
  Trophy,
  Star,
  ArrowRight,
  AlertCircle,
} from "lucide-react"

export default function ThankYouPage() {
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [downloadLink, setDownloadLink] = useState("")
  const [isLoadingDownloadLink, setIsLoadingDownloadLink] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const router = useRouter()

  // Fallback download link (Google Drive)
  const fallbackDownloadLink = "https://drive.google.com/uc?export=download&id=1tnqO7Tw4XVm1asJdnIN3orQrB5rkkJy-"

  useEffect(() => {
    // Verify the payment was successful
    const verifyPayment = () => {
      try {
        const verificationData = sessionStorage.getItem("paymentVerification")

        if (!verificationData) {
          // No verification token found, redirect to homepage
          router.push("/")
          return
        }

        // Parse the verification data
        const paymentData = JSON.parse(verificationData)

        // Check if the payment is verified and not expired (within last 30 minutes)
        const timestamp = new Date(paymentData.timestamp).getTime()
        const now = new Date().getTime()
        const thirtyMinutesInMs = 30 * 60 * 1000

        if (paymentData.verified && now - timestamp < thirtyMinutesInMs) {
          setIsVerified(true)
          setUserData(paymentData)
        } else {
          // Verification failed or expired, redirect to homepage
          router.push("/")
        }
      } catch (error) {
        console.error("Verification error:", error)
        // Error in verification, redirect to homepage
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    verifyPayment()

    // Clear the verification token when component unmounts
    return () => {
      if (typeof window !== "undefined") {
        // We don't clear it immediately to allow for page refreshes
        // In a production app, you'd use a more robust verification system
      }
    }
  }, [router])

  useEffect(() => {
    const fetchDownloadLink = async () => {
      // Only fetch if we don't already have a download link
      if (downloadLink) return

      setIsLoadingDownloadLink(true)
      setDownloadError(null)
      try {
        // Use the App Router API route
        const response = await fetch("/api/generateDownloadLink")

        // Check if the response is OK
        if (!response.ok) {
          const errorText = await response.text()
          console.error("API error response:", errorText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        // Try to parse the JSON
        let data
        try {
          data = await response.json()
        } catch (jsonError) {
          console.error("Error parsing JSON:", jsonError)
          throw new Error("Invalid JSON response from server")
        }

        // Check if there's a warning but we still have a download link
        if (data.warning && data.downloadLink) {
          setDownloadError(`${data.warning} (${data.error || "No details available"})`)
          setDownloadLink(data.downloadLink)
          return
        }

        if (data.error && !data.downloadLink) {
          throw new Error(data.error)
        }

        setDownloadLink(data.downloadLink)
      } catch (error) {
        console.error("Error fetching download link:", error)
        setDownloadError(`Using fallback download link. (Error: ${error.message})`)
        // Use fallback link when API fails
        setDownloadLink(fallbackDownloadLink)
      } finally {
        setIsLoadingDownloadLink(false)
      }
    }

    if (isVerified && !downloadLink) {
      fetchDownloadLink()
    }
  }, [isVerified, fallbackDownloadLink, downloadLink])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 bg-grid-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Verifying your purchase...</p>
        </div>
      </div>
    )
  }

  // If not verified, this will redirect in the useEffect
  if (!isVerified) {
    return null
  }

  // Main thank you page content
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 bg-grid-slate-100">
      <div className="container max-w-5xl px-4 py-12 mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Thank You for Your Purchase!</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your journey to building a profitable faceless social media empire starts now!
          </p>
        </motion.div>

        {/* Order details */}
        <Card className="mb-8 shadow-lg border-2 border-green-100">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Order Confirmed
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-medium">{userData?.orderId || "Not available"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{userData?.email || "customer@example.com"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-medium">$29.00</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm">
                A receipt has been sent to your email. Please check your inbox (and spam folder) for confirmation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Download section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-xl border-2 border-primary/20">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Your Social Media Empire Blueprint Bundle
              </h2>

              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                <h3 className="font-bold mb-2">What's included in your bundle:</h3>
                <ul className="space-y-2">
                  {[
                    "Faceless Mastery Playbook",
                    "Master Sales Funnel",
                    "Master Reels",
                    "Thread Toolkit",
                    "Passive Machine Guide",
                    "META Ads Mini Course",
                    "30-Day Content Calendar",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center">
                <p className="mb-6 font-medium">Click the button below to download your complete bundle:</p>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 shadow-xl glow-red flex items-center gap-2"
                    asChild
                    disabled={isLoadingDownloadLink || !downloadLink}
                  >
                    <a
                      href={downloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!downloadLink) {
                          e.preventDefault()
                        }
                      }}
                    >
                      <Download className="h-5 w-5" />
                      {isLoadingDownloadLink ? "Preparing Download..." : "Download Your Bundle Now"}
                    </a>
                  </Button>
                </motion.div>

                {downloadError ? (
                  <div className="mt-4 text-amber-600 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <p>{downloadError}</p>
                  </div>
                ) : (
                  <p className="text-sm mt-4 text-muted-foreground">
                    {isLoadingDownloadLink
                      ? "Generating secure download link..."
                      : "Click the button above to start the download immediately. The link will expire in 1 hour for security reasons."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Getting started section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Getting Started</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold mb-2">Step 1: Read the Playbook</h3>
                <p className="text-sm text-muted-foreground">
                  Start with the Faceless Mastery Playbook to understand the core strategies and principles.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold mb-2">Step 2: Plan Your Content</h3>
                <p className="text-sm text-muted-foreground">
                  Use the 30-Day Content Calendar to map out your first month of strategic content.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold mb-2">Step 3: Implement Daily</h3>
                <p className="text-sm text-muted-foreground">
                  Spend just 15-30 minutes daily implementing the strategies for consistent growth.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Motivational message */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="shadow-xl border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="hidden md:block">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-4">Your Success Journey Begins Now</h2>
                  <p className="mb-4">
                    Congratulations on taking this important step toward building your faceless social media empire!
                    You've just joined thousands of successful students who have transformed their online presence and
                    created profitable businesses without showing their faces.
                  </p>
                  <p className="mb-4">
                    Remember, consistency is key. The most successful students in our community spend just 15-30 minutes
                    daily implementing these strategies. Within 30 days, you should start seeing noticeable growth, and
                    by day 60-90, many of our students are already making their first sales.
                  </p>
                  <p className="font-bold">
                    Your investment today will pay dividends for years to come. We can't wait to see your success story!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Success Stories From Our Community</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-blue-300">
                    <Image
                      src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&h=150&auto=format&fit=crop"
                      alt="Jamie T."
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">Jamie T.</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="italic mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  "I was terrified of showing my face online, but now I have an 8K follower account and make $2K monthly
                  selling digital templates - all anonymously!"
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-blue-300">
                    <Image
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&auto=format&fit=crop"
                      alt="Mike D."
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">Mike D.</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="italic mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  "I spent $150 on targeted ads using the strategies in the META Ads Mini Course and made $1,200 in
                  sales of my workout templates. Best ROI ever!"
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Support section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Need Help?</h2>
              <p className="mb-4">
                If you have any questions or need assistance with your bundle, our support team is here to help.
              </p>
              <Button variant="outline" className="flex items-center gap-2">
                Contact Support <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2" asChild>
            <a
              href="https://drive.google.com/file/d/1tnqO7Tw4XVm1asJdnIN3orQrB5rkkJy-/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start Your Journey Now <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Remember, your success is our success. We're here to support you every step of the way!
          </p>
        </motion.div>
      </div>
    </div>
  )
}

