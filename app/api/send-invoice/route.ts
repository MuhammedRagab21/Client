import { NextResponse } from "next/server"
import { createAndSendInvoice, type CustomerInfo, type CheckoutItem } from "@/lib/checkout-service"

export async function POST(request: Request) {
  console.log("Received request to send invoice")
  try {
    const { email, orderId, amount, customerName, firstName, lastName, address, options } = await request.json()

    if (!email || !orderId) {
      console.error("Missing required fields:", { email, orderId })
      return NextResponse.json({ error: "Email and order ID are required" }, { status: 400 })
    }

    // Prepare customer info
    const customer: CustomerInfo = {
      email,
      firstName: firstName || customerName || "Valued",
      lastName: lastName || "Customer",
      address,
    }

    // Prepare items
    const items: CheckoutItem[] = [
      {
        name: "Social Media Empire Blueprint Bundle",
        description: "Complete 7-part system with all bonuses",
        quantity: 1,
        unitPrice: Number.parseFloat(amount) || 29.0,
      },
    ]

    // Create and send invoice
    const result = await createAndSendInvoice(orderId, customer, items, options || {})

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Invoice sent successfully",
      invoiceId: result.invoiceId,
    })
  } catch (error) {
    console.error("Error in send-invoice API route:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

