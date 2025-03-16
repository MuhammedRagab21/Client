import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    clientIdExists: !!process.env.PAYPAL_CLIENT_ID,
    clientSecretExists: !!process.env.PAYPAL_CLIENT_SECRET,
    environmentExists: !!process.env.PAYPAL_ENVIRONMENT,
    publicClientIdExists: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    // Don't include actual values in the response for security
  })
}

