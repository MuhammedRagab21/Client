import { NextResponse } from "next/server"

// In a real application, you would store this in a database
const leads: { email: string; timestamp: string; source: string; name?: string }[] = []

// Update the POST function to handle the name parameter
export async function POST(request: Request) {
  try {
    const { email, name, source = "popup" } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Store the new lead with name
    const newLead = {
      email,
      name: name || "Anonymous",
      timestamp: new Date().toISOString(),
      source,
    }

    leads.push(newLead)
    console.log("New lead captured:", newLead)

    // Send to MailerLite if API key and group ID are available
    if (process.env.MAILERLITE_API_KEY && process.env.MAILERLITE_GROUP_ID) {
      try {
        const mailerliteResponse = await fetch("https://api.mailerlite.com/api/v2/subscribers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-MailerLite-ApiKey": process.env.MAILERLITE_API_KEY,
          },
          body: JSON.stringify({
            email,
            name: name || "",
            groups: [process.env.MAILERLITE_GROUP_ID],
            autoresponders: true, // This will trigger the welcome email with the freebie
          }),
        })

        if (!mailerliteResponse.ok) {
          const errorData = await mailerliteResponse.json()
          console.error("MailerLite API error:", errorData)
          // We'll still return success to the user even if MailerLite fails
        } else {
          const data = await mailerliteResponse.json()
          console.log("MailerLite subscription successful:", data)
        }
      } catch (mailerliteError) {
        console.error("Error subscribing to MailerLite:", mailerliteError)
        // We'll still return success to the user even if MailerLite fails
      }
    } else {
      console.warn("MailerLite integration skipped: Missing API key or Group ID")
    }

    // In a real application, you would:
    // 1. Store the email and name in a database
    // 2. Add the subscriber to your email marketing platform
    // 3. Send a welcome email

    // Simulate sending an email
    console.log(`Sending welcome email to ${name || "there"} at ${email}`)

    return NextResponse.json({
      success: true,
      message: "Email subscribed successfully",
      isNewSubscriber: true,
    })
  } catch (error) {
    console.error("Error capturing lead:", error)
    return NextResponse.json({ error: "Failed to process subscription" }, { status: 500 })
  }
}

// For demonstration purposes, add a GET endpoint to view captured leads
export async function GET() {
  // In a production environment, this would be protected by authentication
  return NextResponse.json({ leads })
}

