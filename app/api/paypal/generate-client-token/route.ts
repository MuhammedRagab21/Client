import { NextResponse } from "next/server"
import { getPayPalBaseUrl } from "@/lib/paypal-utils"

export async function GET() {
  try {
    console.log("Generating PayPal client token...")

    // Step 1: Get PayPal access token
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")

    console.log("Requesting access token from PayPal...")
    const tokenResponse = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Failed to get PayPal access token:", errorData)
      return NextResponse.json({ error: "Failed to get PayPal access token", details: errorData }, { status: 500 })
    }

    const tokenData = await tokenResponse.json()
    const { access_token } = tokenData

    if (!access_token) {
      console.error("No access token in PayPal response:", tokenData)
      return NextResponse.json({ error: "No access token in PayPal response" }, { status: 500 })
    }

    console.log("Access token received, generating client token...")

    // Step 2: Generate client token
    const clientTokenResponse = await fetch(`${getPayPalBaseUrl()}/v1/identity/generate-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    })

    if (!clientTokenResponse.ok) {
      const errorData = await clientTokenResponse.text()
      console.error("Failed to generate client token:", errorData)
      return NextResponse.json({ error: "Failed to generate client token", details: errorData }, { status: 500 })
    }

    const clientTokenData = await clientTokenResponse.json()
    const { client_token } = clientTokenData

    if (!client_token) {
      console.error("No client token in PayPal response:", clientTokenData)
      return NextResponse.json({ error: "No client token in PayPal response" }, { status: 500 })
    }

    console.log("Client token generated successfully")
    return NextResponse.json({ clientToken: client_token })
  } catch (error) {
    console.error("Error generating client token:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

