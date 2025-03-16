// Update the PayPal base URL based on environment
export const getPayPalBaseUrl = () => {
  const environment = process.env.PAYPAL_ENVIRONMENT || "sandbox"
  return environment === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"
}

// Verify the PAYPAL_API_URL is correctly set to use the environment variable
export const PAYPAL_API_URL = getPayPalBaseUrl()

export async function getPayPalAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })
  const data = await response.json()
  if (!response.ok) {
    console.error("Failed to get PayPal access token:", data)
    throw new Error("Failed to get PayPal access token")
  }
  return data.access_token
}

async function handleResponse(response, operation) {
  const responseText = await response.text()
  console.log(`Raw ${operation} response:`, responseText)

  if (!response.ok) {
    console.error(`Failed to ${operation}. Status: ${response.status}, Response: ${responseText}`)
    throw new Error(`Failed to ${operation}: ${response.status} ${responseText}`)
  }

  if (!responseText) {
    console.warn(`Empty response for ${operation}`)
    return null
  }

  try {
    return JSON.parse(responseText)
  } catch (e) {
    console.warn(`Invalid JSON in response for ${operation}:`, responseText)
    return responseText
  }
}

export async function createAndSendInvoice(orderDetails, customer) {
  const accessToken = await getPayPalAccessToken()

  // Create invoice
  console.log("Creating invoice...")
  const createInvoiceResponse = await fetch(`${PAYPAL_API_URL}/v2/invoicing/invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      detail: {
        invoice_number: `INV-${orderDetails.id}`,
        reference: orderDetails.id,
        invoice_date: new Date().toISOString().split("T")[0],
        currency_code: "USD",
        note: "Thank you for your purchase!",
        payment_term: {
          term_type: "DUE_ON_RECEIPT",
        },
      },
      invoicer: {
        name: {
          given_name: "Social Media Empire",
          surname: "LLC",
        },
        address: {
          address_line_1: "123 Business St",
          admin_area_2: "San Francisco",
          admin_area_1: "CA",
          postal_code: "94122",
          country_code: "US",
        },
        email_address: "business@socialmediaempire.com",
        phones: [
          {
            country_code: "001",
            national_number: "5555555555",
            phone_type: "MOBILE",
          },
        ],
        website: "https://www.socialmediaempire.com",
        tax_id: "123456789",
        logo_url: "https://example.com/logo.png",
      },
      primary_recipients: [
        {
          billing_info: {
            name: {
              given_name: customer.firstName,
              surname: customer.lastName,
            },
            email_address: customer.email,
            address: {
              address_line_1: customer.address.address_line_1,
              admin_area_2: customer.address.admin_area_2,
              admin_area_1: customer.address.admin_area_1,
              postal_code: customer.address.postal_code,
              country_code: customer.address.country_code,
            },
          },
        },
      ],
      items: [
        {
          name: "Social Media Empire Blueprint Bundle",
          description: "Complete 7-part system with all bonuses",
          quantity: "1",
          unit_amount: {
            currency_code: "USD",
            value: orderDetails.purchase_units[0].amount.value,
          },
        },
      ],
      amount: {
        breakdown: {
          item_total: {
            currency_code: "USD",
            value: orderDetails.purchase_units[0].amount.value,
          },
        },
      },
    }),
  })

  const invoiceData = await handleResponse(createInvoiceResponse, "create invoice")
  console.log("Invoice creation response:", invoiceData)

  if (!invoiceData || !invoiceData.id) {
    console.error("Failed to get invoice ID after creation. Invoice data:", invoiceData)
    throw new Error("Failed to get invoice ID after creation")
  }

  // Send invoice using POST method
  console.log("Sending invoice...")
  const sendInvoiceResponse = await fetch(`${PAYPAL_API_URL}/v2/invoicing/invoices/${invoiceData.id}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      send_to_invoicer: true,
      send_to_recipient: true,
    }),
  })

  const sendInvoiceData = await handleResponse(sendInvoiceResponse, "send invoice")
  console.log("Invoice sent successfully:", sendInvoiceData)

  // Record payment for the invoice
  console.log("Recording payment for invoice...")
  const recordPaymentResponse = await fetch(`${PAYPAL_API_URL}/v2/invoicing/invoices/${invoiceData.id}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      method: "PAYPAL",
      payment_date: new Date().toISOString().split("T")[0],
      amount: {
        currency_code: "USD",
        value: orderDetails.purchase_units[0].amount.value,
      },
      note: "Payment received via PayPal",
    }),
  })

  const recordPaymentData = await handleResponse(recordPaymentResponse, "record payment")
  if (recordPaymentData) {
    console.log("Payment recorded successfully:", recordPaymentData)
  } else {
    console.warn("No confirmation received for payment recording")
  }

  return { invoiceData, sendInvoiceData }
}

