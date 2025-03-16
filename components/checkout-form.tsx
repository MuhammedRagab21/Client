"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PayPalButtons } from "@paypal/react-paypal-js"
import { CreditCard, Lock, ShieldCheck } from "lucide-react"
import type { CustomerInfo, InvoiceOptions } from "@/lib/checkout-service"

interface CheckoutFormProps {
  amount: string
  onSubmit: (customerInfo: CustomerInfo, invoiceOptions: InvoiceOptions) => Promise<void>
  onCreateOrder: () => Promise<string>
  onApprove: (data: any, actions: any) => Promise<void>
  onError: (err: any) => void
  onCancel: () => void
  isSubmitting: boolean
  paymentError: string
}

export function CheckoutForm({
  amount,
  onSubmit,
  onCreateOrder,
  onApprove,
  onError,
  onCancel,
  isSubmitting,
  paymentError,
}: CheckoutFormProps) {
  // Customer information
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  // Address information (optional)
  const [collectAddress, setCollectAddress] = useState(false)
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("US")

  // Invoice options
  const [includeTax, setIncludeTax] = useState(false)
  const [includeShipping, setIncludeShipping] = useState(false)
  const [customNotes, setCustomNotes] = useState("")
  const [sendCopy, setSendCopy] = useState(true)

  // Validation
  const [emailError, setEmailError] = useState("")

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async () => {
    // Reset errors
    setEmailError("")

    // Validate email
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }

    // Prepare customer info
    const customerInfo: CustomerInfo = {
      email,
      firstName,
      lastName,
      address: collectAddress
        ? {
            line1: addressLine1,
            line2: addressLine2,
            city,
            state,
            postalCode,
            country,
          }
        : undefined,
    }

    // Prepare invoice options
    const invoiceOptions: InvoiceOptions = {
      includeTax,
      includeShipping,
      customNotes,
      sendCopy,
    }

    // Submit the form
    await onSubmit(customerInfo, invoiceOptions)
    return true
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Customer Information</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={emailError ? "border-red-500" : ""}
              required
            />
            {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              We'll send your receipt and access instructions to this email
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="collectAddress"
              checked={collectAddress}
              onCheckedChange={(checked) => setCollectAddress(checked === true)}
            />
            <Label htmlFor="collectAddress" className="text-sm font-normal cursor-pointer">
              Add billing address to invoice
            </Label>
          </div>

          {collectAddress && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-2"
            >
              <div>
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input
                  id="addressLine1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input
                  id="addressLine2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apt 4B"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="New York" />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="NY" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="10001"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    {/* Add more countries as needed */}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Invoice Options</h2>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeTax"
              checked={includeTax}
              onCheckedChange={(checked) => setIncludeTax(checked === true)}
            />
            <Label htmlFor="includeTax" className="text-sm font-normal cursor-pointer">
              Include tax calculation on invoice
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeShipping"
              checked={includeShipping}
              onCheckedChange={(checked) => setIncludeShipping(checked === true)}
            />
            <Label htmlFor="includeShipping" className="text-sm font-normal cursor-pointer">
              Include shipping on invoice ($5.99)
            </Label>
          </div>

          <div>
            <Label htmlFor="customNotes">Custom Invoice Notes (Optional)</Label>
            <textarea
              id="customNotes"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Add any special instructions or notes for your invoice"
              className="w-full p-2 border rounded-md h-20"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="sendCopy" checked={sendCopy} onCheckedChange={(checked) => setSendCopy(checked === true)} />
            <Label htmlFor="sendCopy" className="text-sm font-normal cursor-pointer">
              Send me a copy of the invoice
            </Label>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Payment</h2>

        <div className="mb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="text-2xl font-bold text-center">
              <span className="line-through text-muted-foreground mr-2">$297</span>
              <span className="text-red-600">${amount}</span>
            </div>
          </div>

          {paymentError && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">{paymentError}</div>}

          <Tabs defaultValue="paypal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="card">Credit Card</TabsTrigger>
            </TabsList>

            <TabsContent value="paypal" className="pt-4">
              <PayPalButtons
                style={{
                  layout: "vertical",
                  color: "gold",
                  shape: "rect",
                  label: "pay",
                }}
                createOrder={async () => {
                  const valid = await handleSubmit()
                  if (!valid) return ""
                  return onCreateOrder()
                }}
                onApprove={onApprove}
                onError={onError}
                onCancel={onCancel}
                disabled={isSubmitting}
              />
            </TabsContent>

            <TabsContent value="card" className="pt-4">
              <div className="bg-blue-50 p-4 rounded-md text-center">
                <div className="flex justify-center mb-4">
                  <CreditCard className="h-12 w-12 text-blue-500" />
                </div>
                <p className="mb-4">Credit card payments are processed securely through PayPal.</p>
                <p className="text-sm">You don't need a PayPal account to pay with your credit card.</p>
              </div>

              <div className="mt-4">
                <PayPalButtons
                  style={{
                    layout: "vertical",
                    color: "silver",
                    shape: "rect",
                    label: "pay",
                  }}
                  fundingSource="card"
                  createOrder={async () => {
                    const valid = await handleSubmit()
                    if (!valid) return ""
                    return onCreateOrder()
                  }}
                  onApprove={onApprove}
                  onError={onError}
                  onCancel={onCancel}
                  disabled={isSubmitting}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Secure checkout with PayPal</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span>60-day money-back guarantee</span>
          </div>
        </div>
      </div>
    </div>
  )
}

