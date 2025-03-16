"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { SimplePayPalButton } from "@/components/simple-paypal-button"

export default function UpsellPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState("")
  const [purchaseData, setPurchaseData] = useState<any>(null)
  const [isVerified, setIsVerified] = useState(false)
  const router = useRouter()
  const upsellPrice = 97

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

  const handlePaymentSuccess = async (details) => {
    console.log("Upsell payment successful, processing...")
    setIsSubmitting(false)

    // Update purchase data to include upsell
    if (purchaseData) {
      const updatedPurchaseData = {
        ...purchaseData,
        products: {
          ...purchaseData.products,
          upsell: true,
        },
      }
      sessionStorage.setItem("purchaseData", JSON.stringify(updatedPurchaseData))
    }

    // Send to email delivery system
    try {
      await fetch("/api/deliver-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: purchaseData?.email,
          name: purchaseData?.name,
          products: {
            ...purchaseData?.products,
            upsell: true,
          },
        }),
      })
    } catch (error) {
      console.error("Error delivering products:", error)
    }

    // Redirect to success page
    window.location.href = "/success"
  }

  const handlePaymentError = (error) => {
    console.error("Payment error:", error)
    setPaymentError("There was an error processing your payment. Please try again.")
    setIsSubmitting(false)
  }

  const handlePaymentCancel = () => {
    setPaymentError("Payment was cancelled. Please try again when you're ready.")
    setIsSubmitting(false)
  }

  const handleNoThanks = () => {
    // Redirect to downsell page
    router.push("/downsell")
  }

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
      <div className="container max-w-5xl px-4 py-8 mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Order is Complete!</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Wait! Before you go, here's a special one-time offer just for you...
          </p>
        </motion.div>

        <Card className="shadow-xl border-2 border-yellow-300 mb-8">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Your Content is Growing—Now Let's Build a 24/7 Income Machine Around It!
              </h2>
              <p className="text-lg mt-2">
                <span className="font-bold">Ready to monetize your audience?</span> Turn your content into a complete
                business system
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="relative h-60 w-full rounded-lg overflow-hidden mb-4">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-04qdiPhUdZAlLMnGfOe3D55A6oVyzF.png"
                    alt="Premium Business Package"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-bold mb-2">What's Included:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">The Passive Income Playbook</p>
                        <p className="text-sm">
                          Turn Digital Products into 24/7 Sales - Create & sell digital products with ease
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">The Faceless Formula</p>
                        <p className="text-sm">
                          Build a Profitable Brand Without Showing Your Face - Perfect for introverts & privacy seekers
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Sales Funnel Secrets</p>
                        <p className="text-sm">
                          Convert Clicks into Cash on Autopilot - Turn visitors into paying customers with ease
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Why Upgrade Today?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full mt-1">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Turn Content Into Cash</p>
                      <p className="text-sm">
                        Stop creating content that doesn't make money - build a complete business system
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full mt-1">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Automate Your Income</p>
                      <p className="text-sm">
                        Set up systems that make money while you sleep - no more trading time for money
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full mt-1">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Complete Business Blueprint</p>
                      <p className="text-sm">
                        Get the exact roadmap our students use to build 6-figure online businesses
                      </p>
                    </div>
                  </li>
                </ul>

                <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Regular Price:</span>
                    <span className="line-through">$297</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Today Only:</span>
                    <span className="text-red-600">$97</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {paymentError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{paymentError}</div>}

              <div className="mb-4">
                <SimplePayPalButton
                  amount={upsellPrice.toFixed(2)}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              </div>

              <div className="text-center mb-4">
                <p className="font-medium text-green-700">
                  You've started the journey—now let's turn your content into a money-making system! Upgrade now and
                  unlock the full strategy.
                </p>
              </div>

              <Button variant="outline" className="w-full" onClick={handleNoThanks} disabled={isSubmitting}>
                No thanks, I'll stick with my current purchase
              </Button>
            </div>

            <div className="mt-4 flex justify-center space-x-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>60-day guarantee</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

