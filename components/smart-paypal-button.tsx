"use client"

import { useState, useEffect } from "react"
import { SimplePayPalButton } from "./simple-paypal-button"
import { PayPalFastlane } from "./paypal-fastlane"
import { Loader2 } from "lucide-react"

interface SmartPayPalButtonProps {
  amount: string
  onSuccess: (details: any) => void
  onError: (error: any) => void
  onCancel?: () => void
  disabled?: boolean
  buttonText?: string
  email?: string
}

export function SmartPayPalButton({
  amount,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  buttonText = "Complete Purchase with PayPal",
  email,
}: SmartPayPalButtonProps) {
  const [useFastlane, setUseFastlane] = useState(false) // Start with standard PayPal by default
  const [fastlaneError, setFastlaneError] = useState<Error | null>(null)
  const [fastlaneAttempted, setFastlaneAttempted] = useState(false)
  const [isDetecting, setIsDetecting] = useState(true)

  // Check if we should use Fastlane based on device/browser capabilities
  useEffect(() => {
    // Simple feature detection for modern browsers
    const detectFastlaneSupport = () => {
      setIsDetecting(true)

      try {
        const isModernBrowser = "fetch" in window && "Promise" in window && "assign" in Object && "from" in Array

        // Check if not in an iframe (some payment methods don't work in iframes)
        const isNotInIframe = window.self === window.top

        // For now, let's default to standard PayPal for reliability
        // We can enable Fastlane later once the standard buttons are working
        const shouldUseFastlane = false // isModernBrowser && isNotInIframe;

        console.log("PayPal detection:", {
          isModernBrowser,
          isNotInIframe,
          shouldUseFastlane,
        })

        setUseFastlane(shouldUseFastlane)
      } catch (error) {
        console.error("Error detecting Fastlane support:", error)
        setUseFastlane(false)
      } finally {
        setIsDetecting(false)
      }
    }

    detectFastlaneSupport()
  }, [])

  const handleFastlaneError = (error: any) => {
    console.error("Fastlane error, falling back to standard PayPal:", error)
    setFastlaneError(error)
    setFastlaneAttempted(true)
    setUseFastlane(false)
    // Don't call onError yet, as we're falling back to standard PayPal
  }

  if (disabled) {
    return (
      <button disabled className="w-full py-3 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed">
        Please complete required fields
      </button>
    )
  }

  if (isDetecting) {
    return (
      <div className="flex justify-center items-center py-6 bg-gray-50 border border-gray-200 rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Initializing payment options...</span>
      </div>
    )
  }

  // If Fastlane has been attempted and failed, or if we've decided not to use Fastlane,
  // show the standard PayPal button
  if (!useFastlane || fastlaneAttempted) {
    return (
      <div className="space-y-4">
        {fastlaneError && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
            We couldn't load the quick checkout experience. Using standard PayPal checkout instead.
          </div>
        )}
        <SimplePayPalButton
          amount={amount}
          onSuccess={onSuccess}
          onError={onError}
          onCancel={onCancel}
          buttonText={buttonText}
        />
      </div>
    )
  }

  // Otherwise, try to use Fastlane
  return (
    <PayPalFastlane
      amount={amount}
      onSuccess={onSuccess}
      onError={handleFastlaneError}
      onCancel={onCancel}
      buttonText={buttonText}
      email={email}
    />
  )
}

