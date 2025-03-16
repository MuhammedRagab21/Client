"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

interface ReliablePayPalButtonProps {
  amount: string
  onSuccess: (details: any) => void
  onError: (error: any) => void
  onCancel?: () => void
  buttonText?: string
}

export function ReliablePayPalButton({
  amount,
  onSuccess,
  onError,
  onCancel,
  buttonText = "Complete Purchase with PayPal",
}: ReliablePayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCustomButton, setShowCustomButton] = useState(true)
  const paypalButtonRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const scriptLoaded = useRef(false)
  const buttonRendered = useRef(false)

  // Function to load the PayPal script
  const loadPayPalScript = () => {
    // Remove any existing PayPal scripts to avoid conflicts
    const existingScript = document.getElementById("paypal-script")
    if (existingScript) {
      existingScript.remove()
      scriptLoaded.current = false
      buttonRendered.current = false
    }

    // Create and append the script
    const script = document.createElement("script")
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`
    script.id = "paypal-script"
    script.async = true
    script.dataset.namespace = "paypalSDK"

    script.onload = () => {
      console.log("PayPal script loaded successfully")
      scriptLoaded.current = true
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
    if (!window.paypal || !paypalButtonRef.current || buttonRendered.current) {
      return
    }

    try {
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
              onSuccess(details)
            } catch (err) {
              console.error("Payment capture error:", err)
              onError(err)
            }
          },
          onError: (err) => {
            console.error("PayPal error:", err)
            onError(err)
          },
          onCancel: () => {
            console.log("Transaction cancelled")
            if (onCancel) onCancel()
          },
        })
        .render(paypalButtonRef.current)
        .then(() => {
          buttonRendered.current = true
          setIsLoading(false)
          setShowCustomButton(false)
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

  // Handle custom button click
  const handleCustomButtonClick = () => {
    setShowCustomButton(false)

    if (scriptLoaded.current) {
      renderButton()
    } else {
      loadPayPalScript()
    }
  }

  // Load script on mount
  useEffect(() => {
    // We'll use a custom button approach to avoid automatic loading
    // This helps prevent "too many re-renders" errors
    return () => {
      // Cleanup
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current)
      }
    }
  }, [])

  if (error) {
    return (
      <div className="text-center p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600 mb-2">{error}</p>
        <Button
          onClick={() => {
            setError(null)
            setIsLoading(true)
            setShowCustomButton(true)
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="paypal-button-container">
      {showCustomButton ? (
        <Button
          onClick={handleCustomButtonClick}
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
        >
          {buttonText}
        </Button>
      ) : (
        <>
          {isLoading && (
            <div className="flex justify-center items-center py-6 bg-gray-50 border border-gray-200 rounded-md">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading PayPal...</span>
            </div>
          )}
          <div ref={paypalButtonRef} className={isLoading ? "hidden" : "block"} style={{ minHeight: "45px" }}></div>
        </>
      )}
    </div>
  )
}

// Add this to global.d.ts or declare it here
declare global {
  interface Window {
    paypal: any
  }
}

