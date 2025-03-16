"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SimplePayPalButtonProps {
  amount: string
  onSuccess?: (details: any) => void
  onError?: (error: any) => void
  onCancel?: () => void
  disabled?: boolean
  buttonText?: string
}

export function SimplePayPalButton({
  amount,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  buttonText = "Complete Purchase with PayPal",
}: SimplePayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const paypalButtonRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    // Don't load if disabled
    if (disabled) return

    const loadPayPalScript = () => {
      console.log("Loading PayPal script for standard buttons...")

      // Remove any existing PayPal scripts to avoid conflicts
      const existingScript = document.getElementById("paypal-standard-script")
      if (existingScript) {
        existingScript.remove()
      }

      // Create and append the script
      const script = document.createElement("script")
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD&intent=capture`
      script.id = "paypal-standard-script"
      script.async = true

      script.onload = () => {
        console.log("PayPal standard script loaded successfully")
        renderButton()
      }

      script.onerror = (err) => {
        console.error("Failed to load PayPal script:", err)
        setError("Failed to load PayPal. Please try again.")
        setIsLoading(false)
      }

      document.body.appendChild(script)
      scriptRef.current = script
    }

    // Function to render the PayPal button
    const renderButton = () => {
      if (!window.paypal || !paypalButtonRef.current) {
        return
      }

      try {
        console.log("Rendering standard PayPal button...")

        // Clear the container first
        paypalButtonRef.current.innerHTML = ""

        window.paypal
          .Buttons({
            style: {
              layout: "vertical",
              color: "gold",
              shape: "rect",
              label: "paypal",
            },
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: amount,
                    },
                    description: "Content Creator Pro",
                  },
                ],
              })
            },
            onApprove: async (data, actions) => {
              try {
                const details = await actions.order.capture()
                console.log("Payment successful", details)
                if (onSuccess) onSuccess(details)
              } catch (err) {
                console.error("Payment capture error:", err)
                if (onError) onError(err)
              }
            },
            onError: (err) => {
              console.error("PayPal error:", err)
              if (onError) onError(err)
            },
            onCancel: () => {
              console.log("Transaction cancelled")
              if (onCancel) onCancel()
            },
          })
          .render(paypalButtonRef.current)
          .then(() => {
            console.log("PayPal button rendered successfully")
            setIsLoading(false)
          })
          .catch((err) => {
            console.error("Error rendering PayPal button:", err)
            setError("Error rendering PayPal button. Please try again.")
            setIsLoading(false)
          })
      } catch (error) {
        console.error("Error setting up PayPal button:", error)
        setError("Error setting up PayPal button. Please try again.")
        setIsLoading(false)
      }
    }

    loadPayPalScript()

    // Cleanup function
    return () => {
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current)
      }
    }
  }, [amount, onSuccess, onError, onCancel, disabled])

  if (disabled) {
    return (
      <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
        Complete the form to proceed
      </Button>
    )
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
    <div className="paypal-button-container">
      {isLoading && (
        <div className="flex justify-center items-center py-6 bg-gray-50 border border-gray-200 rounded-md">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading PayPal...</span>
        </div>
      )}
      <div ref={paypalButtonRef} className={isLoading ? "hidden" : "block"} style={{ minHeight: "45px" }}></div>
      {buttonText && !isLoading && <p className="text-center text-sm text-gray-500 mt-2">{buttonText}</p>}
    </div>
  )
}

// Add this to global.d.ts or declare it here
declare global {
  interface Window {
    paypal: any
  }
}

