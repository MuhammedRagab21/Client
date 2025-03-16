import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Check if MailerLite credentials are available
    const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY
    const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID

    if (!MAILERLITE_API_KEY || !MAILERLITE_GROUP_ID) {
      console.warn("MailerLite API key or Group ID is missing")
      // Return success but with a warning
      return NextResponse.json({
        success: true,
        warning: "Email captured but not sent to MailerLite due to missing configuration",
        isNewSubscriber: true,
      })
    }

    // Subscribe the user to MailerLite
    const response = await fetch("https://api.mailerlite.com/api/v2/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MailerLite-ApiKey": MAILERLITE_API_KEY,
      },
      body: JSON.stringify({
        email,
        groups: [MAILERLITE_GROUP_ID],
        autoresponders: true, // This will trigger the welcome email with the freebie
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("MailerLite API error:", errorData)
      throw new Error("Failed to subscribe to MailerLite")
    }

    const data = await response.json()
    console.log("MailerLite subscription successful:", data)

    // Store email in localStorage for later use (client-side)
    // This will be handled in the client component

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter",
      isNewSubscriber: true,
    })
  } catch (error) {
    console.error("Error subscribing to MailerLite:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}

