"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface DirectPayPalButtonProps {
  amount: string
  onSuccess?: (details: any) => void
  onError?: (error: any) => void
  onCancel?: () => void
  disabled?: boolean
}

export function DirectPayPalButton({
  amount,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
}: DirectPayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const paypalButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (disabled) return

    // Load the PayPal script
    const script = document.createElement("script")
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`
    script.async = true
    script.onload = () => {
      if (!paypalButtonRef.current || !window.paypal) return

      // Clear any existing content
      paypalButtonRef.current.innerHTML = ""

      // Render the PayPal button
      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: amount,
                  },
                },
              ],
            })
          },
          onApprove: (data, actions) => {
            return actions.order.capture().then((details) => {
              console.log("Payment successful:", details)
              if (onSuccess) onSuccess(details)
            })
          },
          onError: (err) => {
            console.error("PayPal error:", err)
            if (onError) onError(err)
          },
          onCancel: () => {
            console.log("Payment cancelled")
            if (onCancel) onCancel()
          },
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
          },
        })
        .render(paypalButtonRef.current)
        .then(() => {
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Error rendering PayPal button:", err)
          setError("Failed to load PayPal button. Please try again.")
          setIsLoading(false)
        })
    }

    script.onerror = () => {
      setError("Failed to load PayPal. Please try again.")
      setIsLoading(false)
    }

    document.body.appendChild(script)

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [amount, disabled, onCancel, onError, onSuccess])

  if (disabled) {
    return (
      <Button disabled className="w-full">
        Complete the form to proceed
      </Button>
    )
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600 mb-2">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div>
      {isLoading && (
        <div className="flex justify-center items-center py-6 bg-gray-50 border border-gray-200 rounded-md">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading PayPal...</span>
        </div>
      )}
      <div ref={paypalButtonRef} className={isLoading ? "hidden" : "block"} style={{ minHeight: "45px" }}></div>
    </div>
  )
}

declare global {
  interface Window {
    paypal: any
  }
}

