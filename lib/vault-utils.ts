/**
 * Extracts the PayPal payer ID from purchase data
 * Tries multiple possible locations where the ID might be stored
 */
export function extractPayerId(purchaseData: any): string | null {
  if (!purchaseData) return null

  // Try all possible locations where PayPal might store the payer ID
  return (
    purchaseData.payerId ||
    purchaseData.paymentSource?.paypal?.payerId ||
    purchaseData.orderData?.payer?.payer_id ||
    purchaseData.details?.payer?.payer_id ||
    (purchaseData.details?.id && purchaseData.details.id.startsWith("PAY-") ? purchaseData.details.id : null) ||
    null
  )
}

/**
 * Checks if the PayPal Vault can be used based on available purchase data
 */
export function canUseVault(purchaseData: any): boolean {
  return !!extractPayerId(purchaseData)
}

