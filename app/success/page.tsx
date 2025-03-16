"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Download, Mail } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SuccessPage() {
  const [purchaseData, setPurchaseData] = useState<any>(null)
  const [isVerified, setIsVerified] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verify the user has made a purchase
    const verifyPurchase = () => {
      try {
        const purchaseDataStr = sessionStorage.getItem("purchaseData")
        if (!purchaseDataStr) {
          router.push("/")
          return
        }

        const data = JSON.parse(purchaseDataStr)
        setPurchaseData(data)
        setIsVerified(true)
      } catch (error) {
        console.error("Error verifying purchase:", error)
        router.push("/")
      }
    }

    verifyPurchase()
  }, [router])

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Verifying your purchase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 bg-grid-slate-100">
      <div className="container max-w-4xl px-4 py-12 mx-auto">
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
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Your journey to passive income starts now!</p>
        </motion.div>

        <Card className="shadow-xl border-2 border-green-200 mb-8">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Your Purchase Details</h2>

            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-bold mb-2">Products Purchased:</h3>
                <ul className="space-y-2">
                  {purchaseData?.products?.mainProduct && (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p>
                        <span className="font-medium">Cashflow Starter Kit</span> - Create and sell digital products on
                        Instagram
                      </p>
                    </li>
                  )}
                  {purchaseData?.products?.orderBump && (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p>
                        <span className="font-medium">Stories Cash Booster</span> - Transform Instagram Stories into a
                        24/7 sales engine
                      </p>
                    </li>
                  )}
                  {purchaseData?.products?.upsell && (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p>
                        <span className="font-medium">Million-Dollar Growth System</span> - Scale your business with
                        funnels and ads
                      </p>
                    </li>
                  )}
                  {purchaseData?.products?.downsell && (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p>
                        <span className="font-medium">Threads Explosion Hack</span> - Grow your audience on Threads
                      </p>
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-yellow-600" />
                  Check Your Email
                </h3>
                <p className="mb-2">
                  We've sent your purchase details and download links to:{" "}
                  <span className="font-medium">{purchaseData?.email}</span>
                </p>
                <p className="text-sm">
                  If you don't see the email in your inbox, please check your spam or promotions folder. The email
                  should arrive within 5-10 minutes.
                </p>
              </div>

              <div className="text-center">
                <p className="mb-4 font-medium">What happens next?</p>
                <ol className="text-left space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-800 text-sm font-bold">1</span>
                    </div>
                    <p>Check your email for download links to all your purchased products</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-800 text-sm font-bold">2</span>
                    </div>
                    <p>Download and save your guides to your device</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-800 text-sm font-bold">3</span>
                    </div>
                    <p>Start implementing the strategies to build your passive income business</p>
                  </li>
                </ol>

                <Button className="gap-2" asChild>
                  <Link href="/">
                    <Download className="h-4 w-4" />
                    Return to Homepage
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 Passive Income Kickstart. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="#" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="#" className="hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

