"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { emailTemplates, sendEmail } from "@/lib/email-service"

export function useAbandonedCart() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has an email stored
    const userEmail = localStorage.getItem("userEmail")
    if (!userEmail) return

    // Track if user visits checkout page
    const handleRouteChange = (url: string) => {
      if (url.includes("/checkout")) {
        // Set a flag that user visited checkout
        sessionStorage.setItem("visitedCheckout", "true")
      }
    }

    // Listen for route changes
    window.addEventListener("popstate", () => {
      handleRouteChange(window.location.pathname)
    })

    // Set up abandoned cart tracking
    const beforeUnloadHandler = () => {
      const visitedCheckout = sessionStorage.getItem("visitedCheckout")
      const completedPurchase = sessionStorage.getItem("completedPurchase")

      if (visitedCheckout && !completedPurchase && userEmail) {
        // In a real app, you would send this to your server to queue an email
        // For demo purposes, we'll just log it
        console.log("Abandoned cart detected for:", userEmail)

        // Store in localStorage that this user abandoned cart
        localStorage.setItem("abandonedCart", "true")
        localStorage.setItem("abandonedCartTime", new Date().toISOString())
      }
    }

    window.addEventListener("beforeunload", beforeUnloadHandler)

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler)
      window.removeEventListener("popstate", () => {
        handleRouteChange(window.location.pathname)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Function to check and send abandoned cart emails
  const checkAndSendAbandonedCartEmail = async () => {
    const userEmail = localStorage.getItem("userEmail")
    const abandonedCart = localStorage.getItem("abandonedCart")
    const abandonedCartTime = localStorage.getItem("abandonedCartTime")
    const emailSent = localStorage.getItem("abandonedCartEmailSent")

    if (userEmail && abandonedCart && abandonedCartTime && !emailSent) {
      // Check if it's been at least 1 hour since abandonment
      const abandonedTime = new Date(abandonedCartTime).getTime()
      const currentTime = new Date().getTime()
      const hourInMs = 60 * 60 * 1000

      if (currentTime - abandonedTime >= hourInMs) {
        try {
          // Send abandoned cart email
          const template = emailTemplates.abandoned()
          await sendEmail(userEmail, template)

          // Mark as sent
          localStorage.setItem("abandonedCartEmailSent", "true")

          console.log("Abandoned cart email sent to:", userEmail)
          return true
        } catch (error) {
          console.error("Failed to send abandoned cart email:", error)
          return false
        }
      }
    }

    return false
  }

  return { checkAndSendAbandonedCartEmail }
}

