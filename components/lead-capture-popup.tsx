"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface LeadCapturePopupProps {
  onClose: () => void
  onSubmit: (email: string) => Promise<void>
  delay?: number // Delay in milliseconds before showing popup
  exitIntent?: boolean // Whether to show on exit intent (no longer used)
}

export function LeadCapturePopup({ onClose, onSubmit, delay = 3000, exitIntent = false }: LeadCapturePopupProps) {
  // Add a new state variable for name after the email state
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const [thankYouVisible, setThankYouVisible] = useState(false)

  // Show popup after delay on every page load/refresh
  useEffect(() => {
    // Only show popup once per session
    const hasShownPopup = sessionStorage.getItem("hasShownLeadPopup")

    if (!hasShownPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true)
        sessionStorage.setItem("hasShownLeadPopup", "true")
      }, delay)

      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update the validateEmail function to also validate name
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // Update the handleSubmit function to include name validation and submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      // Send email and name to our API route for MailerLite integration
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name, source: "popup" }),
      })

      if (!response.ok) {
        throw new Error("Failed to subscribe")
      }

      // Show success toast
      toast({
        title: "Success!",
        description: "Your free viral hooks guide has been sent to your email!",
      })

      // Show thank you message
      setThankYouVisible(true)
      setIsVisible(false)
    } catch (error) {
      console.error("Error submitting email:", error)
      setError("There was an error subscribing. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to close the popup
  const handleClose = () => {
    setIsVisible(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-full max-w-md px-4"
          >
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardHeader className="relative pb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={handleClose}
                  aria-label="Close popup"
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardTitle className="text-xl text-center">Get Our 30 Most Viral Hooks - FREE!</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-4 text-center">
                  <p className="text-muted-foreground">
                    Join our newsletter and receive our{" "}
                    <span className="font-bold text-primary">30 Most Viral Hooks</span> guide that took us 18+ hours of
                    content analysis to create. These proven hooks will help you create attention-grabbing content that
                    converts!
                  </p>
                </div>
                {/* Update the form in the CardContent to include the name input field */}
                {/* Find the <form> element and add the name input before the email input */}
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={error && !name.trim() ? "border-red-500" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={error && email && !validateEmail(email) ? "border-red-500" : ""}
                      />
                      {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white glow-red"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Get it now!"}
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center pt-0">
                <p className="text-xs text-center text-muted-foreground">
                  We respect your privacy and will never share your information.
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}
      {thankYouVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <Card className="border-2 border-primary/20 shadow-xl max-w-md">
            <CardHeader>
              <CardTitle className="text-xl text-center">One More Step!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">
                We've sent a confirmation email with your free viral hooks guide. Please check your inbox now to confirm
                your subscription.
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                <p className="text-sm font-medium text-yellow-800">
                  Important: If you don't see the email in your inbox, please check your <strong>Promotions tab</strong>{" "}
                  or <strong>Spam folder</strong>.
                </p>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                You must confirm your subscription by clicking the link in the email to receive your free guide.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => setThankYouVisible(false)}>Got it!</Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

