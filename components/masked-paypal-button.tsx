"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PayPalDirectButton } from "./paypal-direct-button"

interface MaskedPayPalButtonProps {
  amount: string
  onSuccess: (details: any) => void
  onError: (error: any) => void
  onCancel?: () => void
  buttonText?: string
}

export function MaskedPayPalButton({
  amount,
  onSuccess,
  onError,
  onCancel,
  buttonText = "I want this one too! Let's buy it",
}: MaskedPayPalButtonProps) {
  const [showPayPal, setShowPayPal] = useState(false)

  if (showPayPal) {
    return (
      <div className="space-y-4">
        <p className="text-center text-sm font-medium text-gray-600">Complete your purchase with PayPal:</p>
        <PayPalDirectButton amount={amount} onSuccess={onSuccess} onError={onError} onCancel={onCancel} />
      </div>
    )
  }

  return (
    <Button
      onClick={() => setShowPayPal(true)}
      className="w-full py-6 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
    >
      {buttonText}
    </Button>
  )
}

