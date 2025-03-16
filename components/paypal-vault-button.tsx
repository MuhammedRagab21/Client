"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { extractPayerId } from "@/lib/vault-utils"

interface PayPalVaultButtonProps {
  amount: string
  customerId?: string
  onSuccess: (details: any) => void
  onError: (error: any) => void
  buttonText?: string
  className?: string
}

export function PayPalVaultButton({
  amount,
  customerId,
  onSuccess,
  onError,
  buttonText = "I want this one too! Let's buy it",
  className = "",
}: PayPalVaultButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleClick = async () => {
    setIsProcessing(true)

    try {
      // Get the customer ID from session storage if not provided
      const purchaseDataStr = sessionStorage.getItem("purchaseData")
      const purchaseData = purchaseDataStr ? JSON.parse(purchaseDataStr) : {}

      // Use the utility function to extract the payer ID
      const payerId = customerId || extractPayerId(purchaseData)

      if (!payerId) {
        // If we still can't find a payer ID, we'll need to create a new PayPal button
        throw new Error("Customer ID not found. Please use the PayPal button below to complete your purchase.")
      }

      // Call your API to process the payment using the vault
      const response = await fetch("/api/process-vault-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          payerId,
          description: "Content Creator Pro - Business Package Upgrade",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Payment processing failed")
      }

      const paymentResult = await response.json()

      // Handle successful payment
      toast({
        title: "Payment Successful!",
        description: "Your upgrade has been processed successfully.",
        variant: "default",
      })

      onSuccess(paymentResult)
    } catch (error) {
      console.error("Vault payment error:", error)

      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })

      onError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isProcessing}
        className={`w-full py-6 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 ${className}`}
      >
        {isProcessing ? "Processing payment..." : buttonText}
      </Button>
    </>
  )
}

