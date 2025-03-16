"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { SimplePayPalButton } from "@/components/simple-paypal-button"

export default function DownsellPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState("")
  const [purchaseData, setPurchaseData] = useState<any>(null)
  const [isVerified, setIsVerified] = useState(false)
  const router = useRouter()
  const downsellPrice = 47

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
    console.log("Downsell payment successful, processing...")
    setIsSubmitting(false)

    // Update purchase data to include downsell
    if (purchaseData) {
      const updatedPurchaseData = {
        ...purchaseData,
        products: {
          ...purchaseData.products,
          downsell: true,
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
            downsell: true,
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
    // Send to email delivery system for main product only
    try {
      fetch("/api/deliver-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: purchaseData?.email,
          name: purchaseData?.name,
          products: purchaseData?.products,
        }),
      })
    } catch (error) {
      console.error("Error delivering products:", error)
    }

    // Redirect to success page
    window.location.href = "/success"
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Wait! Here's a Special Offer</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Not Ready for the Full Business Package? Get the Shortcut to More Reach & More Sales Instead!
          </p>
        </motion.div>

        <Card className="shadow-xl border-2 border-blue-300 mb-8">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Growth & Sales Accelerator Package
              </h2>
              <p className="text-lg mt-2">
                Get more views, more followers, and more sales with these proven strategies
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="relative h-60 w-full rounded-lg overflow-hidden mb-4">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OFo6I1IIBGrewD9hHCObFz6iiLmDDk.png"
                    alt="Growth & Sales Accelerator"
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
                        <p className="font-medium">Reels Domination</p>
                        <p className="text-sm">
                          The Ultimate Guide to Viral Short-Form Content - Master the art of viral Reels that explode
                          your reach
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Meta Ads Mastery</p>
                        <p className="text-sm">
                          The Fast-Track Guide to Profitable Facebook & IG Ads - Launch ads that actually convert
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Why Add This Today?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full mt-1">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Explode Your Reach</p>
                      <p className="text-sm">
                        Get in front of thousands of new potential customers with viral content strategies
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full mt-1">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Start Making Sales Now</p>
                      <p className="text-sm">
                        Don't wait months for organic growth - start driving targeted traffic today
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full mt-1">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Perfect Complement</p>
                      <p className="text-sm">
                        These strategies work perfectly with the content templates you already purchased
                      </p>
                    </div>
                  </li>
                </ul>

                <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Regular Price:</span>
                    <span className="line-through">$97</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Today Only:</span>
                    <span className="text-red-600">$47</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {paymentError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{paymentError}</div>}

              <div className="mb-4">
                <SimplePayPalButton
                  amount={downsellPrice.toFixed(2)}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              </div>

              <div className="text-center mb-4">
                <p className="font-medium text-green-700">
                  If you're not ready to scale to a full business yet, let's at least help you get more views & sales
                  today. Grab this shortcut now!
                </p>
              </div>

              <Button variant="outline" className="w-full" onClick={handleNoThanks} disabled={isSubmitting}>
                No thanks, I'll continue with my current purchase
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

