import { NextResponse } from "next/server"
import { getPayPalAccessToken, PAYPAL_API_URL } from "@/lib/paypal-utils"

export async function POST(request: Request) {
  try {
    const { invoiceId, customizations } = await request.json()

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 })
    }

    console.log(`Customizing invoice ${invoiceId}`)

    const accessToken = await getPayPalAccessToken()

    // First, get the current invoice
    const getInvoiceResponse = await fetch(`${PAYPAL_API_URL}/v2/invoicing/invoices/${invoiceId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!getInvoiceResponse.ok) {
      const errorData = await getInvoiceResponse.json()
      console.error("Failed to get invoice:", errorData)
      return NextResponse.json({ error: "Failed to get invoice" }, { status: 500 })
    }

    const invoiceData = await getInvoiceResponse.json()

    // Apply customizations
    if (customizations.note) {
      invoiceData.detail.note = customizations.note
    }

    if (customizations.terms) {
      invoiceData.detail.terms = customizations.terms
    }

    if (customizations.memo) {
      invoiceData.detail.memo = customizations.memo
    }

    // Update the invoice
    const updateInvoiceResponse = await fetch(`${PAYPAL_API_URL}/v2/invoicing/invoices/${invoiceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(invoiceData),
    })

    if (!updateInvoiceResponse.ok) {
      const errorData = await updateInvoiceResponse.json()
      console.error("Failed to update invoice:", errorData)
      return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Invoice customized successfully" })
  } catch (error) {
    console.error("Error customizing invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

