"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

declare global {
  interface Window {
    paypal: any
  }
}

interface PayPalFastlaneProps {
  amount: string
  onSuccess: (details: any) => void
  onError: (error: any) => void
  onCancel?: () => void
  buttonText?: string
  email?: string
}

export function PayPalFastlane({
  amount,
  onSuccess,
  onError,
  onCancel,
  buttonText = "Complete Purchase",
  email = "",
}: PayPalFastlaneProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState(email)
  const [clientToken, setClientToken] = useState<string | null>(null)
  const [customerContextId, setCustomerContextId] = useState("")
  const [isFastlaneMember, setIsFastlaneMember] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const paymentContainerRef = useRef<HTMLDivElement>(null)
  const watermarkRef = useRef<HTMLDivElement>(null)
  const fastlaneRef = useRef<any>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  // Use email prop if provided
  useEffect(() => {
    if (email) {
      setUserEmail(email)
    }
  }, [email])

  // Step 1: Fetch client token from server
  useEffect(() => {
    const fetchClientToken = async () => {
      try {
        console.log("Fetching client token for Fastlane...")
        const response = await fetch("/api/paypal/generate-client-token")
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Client token error response:", errorText)
          throw new Error(`Failed to generate client token: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()
        console.log("Client token received for Fastlane")
        setClientToken(data.clientToken)
      } catch (error) {
        console.error("Error fetching client token:", error)
        setError("Failed to initialize PayPal Fastlane. Please try again later.")
        setIsLoading(false)
        onError(error)
      }
    }

    fetchClientToken()
  }, [onError])

  // Step 2: Load PayPal SDK with client token
  useEffect(() => {
    if (!clientToken) return

    const loadPayPalScript = () => {
      console.log("Loading PayPal script with client token for Fastlane...")

      // Remove any existing PayPal scripts to avoid conflicts
      const existingScript = document.getElementById("paypal-fastlane-script")
      if (existingScript) {
        existingScript.remove()
      }

      const script = document.createElement("script")
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&components=fastlane&currency=USD&intent=capture`
      script.id = "paypal-fastlane-script"
      script.async = true
      script.setAttribute("data-sdk-integration-source", "button-factory")
      script.setAttribute("data-sdk-client-token", clientToken)

      script.onload = () => {
        console.log("PayPal Fastlane script loaded successfully")
        initFastlane()
      }

      script.onerror = (err) => {
        console.error("Failed to load PayPal Fastlane script:", err)
        setError("Failed to load PayPal Fastlane. Please try again.")
        setIsLoading(false)
        onError(new Error("Failed to load PayPal Fastlane script"))
      }

      document.body.appendChild(script)
      scriptRef.current = script
    }

    loadPayPalScript()

    // Cleanup function
    return () => {
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current)
      }
    }
  }, [clientToken, onError])

  // Step 3: Initialize Fastlane
  const initFastlane = () => {
    try {
      console.log("Initializing Fastlane...")

      if (!window.paypal) {
        throw new Error("PayPal script loaded but window.paypal is not defined")
      }

      if (!window.paypal.Fastlane) {
        throw new Error("PayPal script loaded but Fastlane module not available")
      }

      // Initialize Fastlane with empty customerContextId (will be set after email lookup)
      fastlaneRef.current = window.paypal.Fastlane({
        customerContextId: customerContextId,
        allowGuest: true,
        style: {
          backgroundColor: "#ffffff",
          borderColor: "#e5e7eb",
        },
      })

      console.log("Fastlane initialized:", fastlaneRef.current)

      // Render watermark component if we have a container
      if (watermarkRef.current) {
        try {
          fastlaneRef.current.renderWatermark({
            container: watermarkRef.current,
            includeAdditionalInfo: true,
          })
          console.log("Watermark rendered")
        } catch (watermarkError) {
          console.error("Error rendering watermark:", watermarkError)
        }
      }

      setIsLoading(false)

      // If email is already provided, proceed with lookup
      if (userEmail) {
        handleEmailLookup()
      }
    } catch (error) {
      console.error("Error initializing Fastlane:", error)
      setError("Error initializing PayPal Fastlane. Please try the standard checkout.")
      setIsLoading(false)
      onError(error)
    }
  }

  // Step 4: Handle email lookup
  const handleEmailLookup = async () => {
    if (!userEmail || !fastlaneRef.current) {
      console.error("Cannot lookup email: email is empty or fastlane not initialized")
      return
    }

    setIsProcessing(true)

    try {
      console.log("Looking up customer by email:", userEmail)
      const result = await fastlaneRef.current.lookupCustomerByEmail({ email: userEmail })
      console.log("Email lookup result:", result)

      if (result.customerContextId) {
        setCustomerContextId(result.customerContextId)

        // Update Fastlane with the new customerContextId
        fastlaneRef.current = window.paypal.Fastlane({
          customerContextId: result.customerContextId,
          allowGuest: true,
        })

        if (result.isFastlaneMember) {
          setIsFastlaneMember(true)
          // Trigger authentication flow for Fastlane members
          triggerAuthenticationFlow()
        } else {
          // PayPal member or guest, proceed to payment
          renderPaymentFields()
        }
      } else {
        // Guest user, proceed to payment
        renderPaymentFields()
      }
    } catch (error) {
      console.error("Error during email lookup:", error)
      setError("Error looking up email. Falling back to standard checkout.")
      onError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 5: Authenticate Fastlane profile if applicable
  const triggerAuthenticationFlow = async () => {
    try {
      console.log("Triggering authentication flow...")
      const authResult = await fastlaneRef.current.triggerAuthenticationFlow()
      console.log("Authentication result:", authResult)

      if (authResult.authenticationState === "AUTHENTICATED") {
        setIsAuthenticated(true)
        console.log("User authenticated with Fastlane", authResult.profileData)
        renderPaymentFields()
      } else {
        // Failed authentication, continue as guest
        console.log("Authentication failed or declined, continuing as guest")
        renderPaymentFields()
      }
    } catch (error) {
      console.error("Authentication error:", error)
      // Continue as guest on error
      renderPaymentFields()
    }
  }

  // Step 6: Render payment fields
  const renderPaymentFields = async () => {
    if (!paymentContainerRef.current || !fastlaneRef.current) {
      console.error("Cannot render payment fields: container ref or fastlane not available")
      return
    }

    try {
      console.log("Rendering payment fields...")

      // Clear container first
      paymentContainerRef.current.innerHTML = ""

      // Render payment fields
      const paymentFieldsResponse = await fastlaneRef.current.renderPaymentFields({
        container: paymentContainerRef.current,
        onShippingAddressChange: (address) => {
          console.log("Shipping address changed:", address)
        },
        onError: (err) => {
          console.error("Payment fields error:", err)
          setError("Error with payment fields. Please try again.")
          onError(err)
        },
      })

      console.log("Payment fields rendered")

      // Add a checkout button
      const checkoutButton = document.createElement("button")
      checkoutButton.className = "w-full py-3 mt-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      checkoutButton.textContent = buttonText
      checkoutButton.addEventListener("click", () => handlePayment(paymentFieldsResponse))

      paymentContainerRef.current.appendChild(checkoutButton)
    } catch (error) {
      console.error("Error rendering payment fields:", error)
      setError("Error setting up payment form. Falling back to standard checkout.")
      onError(error)
    }
  }

  // Step 7: Handle payment
  const handlePayment = async (paymentFieldsResponse) => {
    setIsProcessing(true)

    try {
      console.log("Getting payment token...")
      // Get payment token
      const { paymentToken } = await paymentFieldsResponse.getPaymentToken()

      if (!paymentToken) {
        throw new Error("Failed to get payment token")
      }

      console.log("Payment token received, creating order...")

      // Create order with payment token
      const createOrderResponse = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart: {
            amount: {
              value: amount,
              currency_code: "USD",
            },
            description: "Content Creator Pro",
          },
          paymentToken,
        }),
      })

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json()
        throw new Error(errorData.error || "Failed to create order")
      }

      const orderData = await createOrderResponse.json()
      console.log("Order created:", orderData)

      // Capture the order
      console.log("Capturing order...")
      const captureResponse = await fetch("/api/orders/capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderID: orderData.id,
        }),
      })

      if (!captureResponse.ok) {
        const errorData = await captureResponse.json()
        throw new Error(errorData.error || "Failed to capture order")
      }

      const captureData = await captureResponse.json()
      console.log("Order captured:", captureData)
      onSuccess(captureData)
    } catch (error) {
      console.error("Payment error:", error)
      onError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600 mb-2">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center items-center py-6 bg-gray-50 border border-gray-200 rounded-md">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading PayPal Fastlane...</span>
        </div>
      ) : (
        <>
          {/* Email input section */}
          {!isAuthenticated && !customerContextId && !email && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="payerEmail">Email Address</Label>
                <Input
                  id="payerEmail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isProcessing}
                />
              </div>

              <Button onClick={handleEmailLookup} disabled={!userEmail || isProcessing} className="w-full">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue to Payment"
                )}
              </Button>

              <div ref={watermarkRef} className="flex justify-center mt-2"></div>
            </div>
          )}

          {/* Payment fields container */}
          <div ref={paymentContainerRef} className="space-y-4"></div>

          {/* Cancel button */}
          {!isProcessing && (
            <Button variant="outline" onClick={handleCancel} className="w-full mt-2">
              Cancel
            </Button>
          )}
        </>
      )}
    </div>
  )
}

