"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, ChevronLeft, Lock, ShieldCheck } from "lucide-react"
import { useAbandonedCart } from "@/hooks/use-abandoned-cart"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SmartPayPalButton } from "@/components/smart-paypal-button"
import { DirectPayPalButton } from "@/components/direct-paypal-button"

export default function CheckoutPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState("")
  const [includeOrderBump, setIncludeOrderBump] = useState(false)
  const [basePrice] = useState(17)
  const [orderBumpPrice] = useState(27)
  const [totalPrice, setTotalPrice] = useState(17)
  const [formIsValid, setFormIsValid] = useState(false)

  const { checkAndSendAbandonedCartEmail } = useAbandonedCart()

  useEffect(() => {
    sessionStorage.setItem("visitedCheckout", "true")
    checkAndSendAbandonedCartEmail()
  }, [checkAndSendAbandonedCartEmail])

  // Update total price when order bump selection changes
  useEffect(() => {
    setTotalPrice(includeOrderBump ? basePrice + orderBumpPrice : basePrice)
  }, [includeOrderBump, basePrice, orderBumpPrice])

  // Store customer info for abandoned cart recovery
  useEffect(() => {
    if (email) {
      localStorage.setItem("userEmail", email)
    }
    if (name) {
      localStorage.setItem("userName", name)
    }
  }, [email, name])

  // Validate form whenever email or name changes
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setFormIsValid(Boolean(name) && Boolean(email) && emailRegex.test(email))
  }, [email, name])

  const handlePaymentSuccess = async (details) => {
    console.log("Payment successful, processing...")
    setIsSubmitting(false)

    const paypalOrderId = details.id

    // Extract customer information from PayPal response
    const customer = {
      email: details.payer.email_address || email,
      firstName: details.payer.name.given_name || name.split(" ")[0],
      lastName: details.payer.name.surname || name.split(" ")[1] || "",
      address: details.purchase_units[0].shipping?.address || {},
    }

    sessionStorage.setItem("completedPurchase", "true")

    // Store purchase details for upsell/downsell flow
    const purchaseData = {
      email: customer.email,
      name: `${customer.firstName} ${customer.lastName}`,
      timestamp: new Date().toISOString(),
      orderId: paypalOrderId,
      verified: true,
      products: {
        mainProduct: true,
        orderBump: includeOrderBump,
        upsell: false,
        downsell: false,
      },
      customer: customer,
    }

    sessionStorage.setItem("purchaseData", JSON.stringify(purchaseData))

    // Redirect to upsell page
    window.location.href = "/upsell"
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 bg-grid-slate-100">
      <div className="container max-w-6xl px-4 py-8 mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to main page
          </Link>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Left Column - Order Summary */}
          <div className="md:col-span-3 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Complete Your Order</h1>
              <p className="text-muted-foreground">
                Struggling to Stay Consistent on Social Media? Get Ready-to-Post Content & Watch Your Engagement Soar!
              </p>
            </motion.div>

            <Card className="shadow-md">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="flex items-center gap-4 border-b pb-4 mb-4">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jmNBTm1WfHuOtyl2vdlezPmI8ji4Ts.png"
                      alt="Social Media Content Bundle"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold">Social Media Content Bundle</h3>
                    <p className="text-sm text-muted-foreground">Ready-to-Post Content for Instagram & Threads</p>
                  </div>
                </div>

                {/* Order Bump */}
                <div className="mb-6 p-4 border-2 border-yellow-300 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      <Checkbox
                        id="orderBump"
                        checked={includeOrderBump}
                        onCheckedChange={(checked) => setIncludeOrderBump(checked === true)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="orderBump" className="font-bold text-lg cursor-pointer">
                        Add "Story Selling Secrets" for just $27
                      </Label>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-zYQjTQw2VasuL9H4FeN2LGQQJXMMsP.png"
                            alt="Story Selling Secrets"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">Want to Make Money from Your Content?</span> This is the
                            Fastest Way to Turn Followers into Customers! Sell in Stories Without Feeling "Salesy" –
                            Master the art of authentic selling using storytelling techniques that build trust and drive
                            sales.
                          </p>
                          <p className="text-sm mt-1 font-medium text-green-700">
                            Add this to your order now and discover the secrets of selling on Stories—without being
                            'salesy'!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Social Media Content Bundle:</span>
                    <span>${basePrice.toFixed(2)}</span>
                  </div>
                  {includeOrderBump && (
                    <div className="flex justify-between">
                      <span>Story Selling Secrets:</span>
                      <span>${orderBumpPrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    <span>What's included in your bundle:</span>
                  </h3>
                  <ul className="space-y-2">
                    {[
                      "100 Viral Reels & Carousel Templates for Explosive IG Growth",
                      "Threads Authority: 35 Fill-in-the-Blank Templates for Instant Engagement",
                      includeOrderBump && "Story Selling Secrets: Convert Followers into Customers Using IG Stories",
                      "60-day money-back guarantee",
                      "Lifetime access to all future updates",
                    ]
                      .filter(Boolean)
                      .map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment section */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="shadow-md sticky top-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Payment</h2>

                  <div className="mb-6">
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full p-2 border rounded-md"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll send your receipt and access instructions to this email
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="text-2xl font-bold text-center">
                        <span className="line-through text-muted-foreground mr-2">
                          ${includeOrderBump ? "97" : "47"}
                        </span>
                        <span className="text-red-600">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {paymentError && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">{paymentError}</div>
                    )}

                    <div className="mb-4">
                      {/* Try the smart button first */}
                      <SmartPayPalButton
                        amount={totalPrice.toFixed(2)}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        onCancel={handlePaymentCancel}
                        disabled={!formIsValid}
                        email={formIsValid ? email : undefined}
                        buttonText="Complete Purchase with PayPal"
                      />

                      {/* Add a fallback direct button if needed */}
                      {paymentError && (
                        <div className="mt-4">
                          <p className="text-sm text-center mb-2">
                            If the PayPal button doesn't appear above, try this alternative:
                          </p>
                          <DirectPayPalButton
                            amount={totalPrice.toFixed(2)}
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                            onCancel={handlePaymentCancel}
                            disabled={!formIsValid}
                          />
                        </div>
                      )}
                    </div>

                    <div className="text-center mb-4">
                      <p className="font-medium text-green-700">
                        Get instant access to done-for-you content and start growing your social media today!
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span>Secure checkout with PayPal</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                      <span>60-day money-back guarantee</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>© 2024 Social Media Empire. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="#" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="#" className="hover:underline">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

