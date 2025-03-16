import { NextResponse } from "next/server"
import { getPayPalAccessToken, PAYPAL_API_URL } from "@/lib/paypal-utils"

export async function POST(request: Request) {
  try {
    const { cart } = await request.json()

    if (!cart || !cart.amount || !cart.amount.value) {
      return NextResponse.json({ error: "Invalid cart data" }, { status: 400 })
    }

    console.log("Creating order with cart:", cart)

    const accessToken = await getPayPalAccessToken()

    // Create order
    const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "PayPal-Request-Id": `order-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: cart.description || "Cashflow Starter Kit",
            amount: {
              currency_code: cart.amount.currency_code || "USD",
              value: cart.amount.value || "17.00",
            },
            custom_id: JSON.stringify(cart.products || { mainProduct: true }),
          },
        ],
        application_context: {
          brand_name: "Cashflow Starter Kit",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: "https://example.com/return",
          cancel_url: "https://example.com/cancel",
        },
      }),
    })

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json()
      console.error("PayPal order creation error:", errorData)
      return NextResponse.json(
        { error: errorData.message || "Failed to create PayPal order" },
        { status: orderResponse.status },
      )
    }

    const orderData = await orderResponse.json()

    if (!orderData.id) {
      console.error("No order ID in PayPal response:", orderData)
      return NextResponse.json({ error: "No order ID received from PayPal" }, { status: 500 })
    }

    console.log("Order created successfully with ID:", orderData.id)

    return NextResponse.json({
      id: orderData.id,
      status: orderData.status,
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

