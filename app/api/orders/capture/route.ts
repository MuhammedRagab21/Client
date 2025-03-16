import { NextResponse } from "next/server"
import { getPayPalAccessToken, PAYPAL_API_URL, createAndSendInvoice } from "@/lib/paypal-utils"

export async function POST(request: Request) {
  try {
    const { orderID } = await request.json()

    if (!orderID) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    console.log("Capturing order:", orderID)

    const accessToken = await getPayPalAccessToken()

    // Capture order
    const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "PayPal-Request-Id": `capture-${orderID}-${Date.now()}`,
      },
    })

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json()
      console.error("PayPal capture error:", errorData)
      return NextResponse.json(
        { error: errorData.message || "Failed to capture PayPal order" },
        { status: captureResponse.status },
      )
    }

    const captureData = await captureResponse.json()

    // Create and send invoice
    try {
      const invoiceData = await createAndSendInvoice(captureData)
      console.log("Invoice created and sent successfully:", invoiceData)
    } catch (error) {
      console.error("Error creating and sending invoice:", error)
      // Note: We're not stopping the process here as the payment was successful
    }

    return NextResponse.json({
      id: captureData.id,
      status: captureData.status,
      payer: captureData.payer,
      purchase_units: captureData.purchase_units,
    })
  } catch (error) {
    console.error("Error capturing order:", error)
    return NextResponse.json({ error: "Failed to capture order" }, { status: 500 })
  }
}

