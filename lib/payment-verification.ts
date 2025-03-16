export interface PaymentVerificationData {
  email: string
  orderId: string
  timestamp: string
  verified: boolean
}

export function storePaymentVerification(data: PaymentVerificationData): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("paymentVerification", JSON.stringify(data))
  }
}

export function getPaymentVerification(): PaymentVerificationData | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const data = sessionStorage.getItem("paymentVerification")
    if (!data) return null

    return JSON.parse(data) as PaymentVerificationData
  } catch (error) {
    console.error("Error parsing payment verification data:", error)
    return null
  }
}

export function verifyPayment(): { isVerified: boolean; userData: PaymentVerificationData | null } {
  try {
    const paymentData = getPaymentVerification()

    if (!paymentData) {
      return { isVerified: false, userData: null }
    }

    // Check if the payment is verified and not expired (within last 30 minutes)
    const timestamp = new Date(paymentData.timestamp).getTime()
    const now = new Date().getTime()
    const thirtyMinutesInMs = 30 * 60 * 1000

    if (paymentData.verified && now - timestamp < thirtyMinutesInMs) {
      return { isVerified: true, userData: paymentData }
    } else {
      return { isVerified: false, userData: null }
    }
  } catch (error) {
    console.error("Verification error:", error)
    return { isVerified: false, userData: null }
  }
}

