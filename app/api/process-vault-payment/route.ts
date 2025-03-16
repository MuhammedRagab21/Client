import { NextResponse } from "next/server"
import { getPayPalAccessToken, PAYPAL_API_URL } from "@/lib/paypal-utils"

export async function POST(request: Request) {
  try {
    const { amount, payerId, description } = await request.json()

    if (!amount || !payerId) {
      return NextResponse.json({ message: "Amount and PayerID are required" }, { status: 400 })
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Create an order using the vault
    const createOrderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        payer: {
          payer_id: payerId,
        },
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount,
            },
            description: description || "Content Creator Pro Upgrade",
          },
        ],
        payment_source: {
          token: {
            id: payerId,
            type: "PAYMENT_METHOD_TOKEN",
          },
        },
      }),
    })

    const orderData = await createOrderResponse.json()

    if (!createOrderResponse.ok) {
      console.error("Failed to create order:", orderData)
      return NextResponse.json(
        { message: "Failed to create order", details: orderData },
        { status: createOrderResponse.status },
      )
    }

    // Capture the order immediately
    const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderData.id}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const captureData = await captureResponse.json()

    if (!captureResponse.ok) {
      console.error("Failed to capture order:", captureData)
      return NextResponse.json(
        { message: "Failed to capture payment", details: captureData },
        { status: captureResponse.status },
      )
    }

    return NextResponse.json(captureData)
  } catch (error) {
    console.error("Error processing vault payment:", error)
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 })
  }
}

