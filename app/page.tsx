"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Instagram,
  Layout,
  Lock,
  MessageSquare,
  Play,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Video,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

// Add these imports at the top of the file
import { LeadCapturePopup } from "@/components/lead-capture-popup"
import { emailTemplates, sendEmail } from "@/lib/email-service"
import { useToast } from "@/hooks/use-toast"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// Creator type quiz options
const creatorTypes = [
  {
    id: "beginner",
    title: "Complete Beginner",
    description: "I'm just starting out and have little to no social media experience.",
  },
  {
    id: "growing",
    title: "Growing Creator",
    description: "I have some followers but struggle to maintain consistency.",
  },
  {
    id: "experienced",
    title: "Experienced Creator",
    description: "I have an established presence but need fresh content ideas.",
  },
]

// Niche options
const nicheOptions = [
  {
    id: "finance",
    title: "Finance & Investing",
    description: "Wealth building, investing, and financial education",
  },
  {
    id: "lifestyle",
    title: "Lifestyle & Wellness",
    description: "Self-improvement, wellness, and lifestyle optimization",
  },
  {
    id: "business",
    title: "Business & Marketing",
    description: "Entrepreneurship, marketing, and business growth",
  },
  {
    id: "other",
    title: "Other Niche",
    description: "I have a different niche in mind",
  },
]

export default function LandingPage() {
  const countdownRef = useRef(null)
  const liveCounterRef = useRef(null)
  const { scrollY } = useScroll()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [creatorType, setCreatorType] = useState("")
  const [niche, setNiche] = useState("")
  const [showQuizResults, setShowQuizResults] = useState(false)
  const router = useRouter()

  // Inside the LandingPage component, add these new state variables
  const [showLeadPopup, setShowLeadPopup] = useState(false)
  const { toast } = useToast()

  // Parallax effect for hero section
  const { scrollY: heroScrollY } = useScroll()
  const heroOpacity = useTransform(heroScrollY, [0, 300], [1, 0.3])
  const heroY = useTransform(heroScrollY, [0, 300], [0, 100])

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Initialize countdown timer with GSAP
  useEffect(() => {
    if (!countdownRef.current) return

    const endTime = new Date()
    endTime.setHours(endTime.getHours() + 2)
    endTime.setMinutes(endTime.getMinutes() + 34)
    endTime.setSeconds(endTime.getSeconds() + 18)

    const updateTimer = () => {
      const now = new Date()
      const diff = endTime - now

      if (diff <= 0) {
        clearInterval(interval)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (countdownRef.current) {
        countdownRef.current.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [])

  // Simulate live counter
  useEffect(() => {
    if (!liveCounterRef.current) return

    const updateCounter = () => {
      const baseCount = 12
      const randomVariation = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
      const newCount = baseCount + randomVariation

      if (liveCounterRef.current) {
        gsap.to(liveCounterRef.current, {
          opacity: 0.5,
          duration: 0.2,
          onComplete: () => {
            if (liveCounterRef.current) {
              liveCounterRef.current.textContent = `${newCount} people bought this in the last 20 minutes`
              gsap.to(liveCounterRef.current, {
                opacity: 1,
                duration: 0.2,
              })
            }
          },
        })
      }
    }

    const interval = setInterval(updateCounter, 5000)
    return () => clearInterval(interval)
  }, [])

  // GSAP animations for sections
  useEffect(() => {
    const sections = document.querySelectorAll("section")

    sections.forEach((section) => {
      gsap.fromTo(
        section.querySelectorAll("h2, h3, p, .card"),
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      )
    })
  }, [])

  // Handle quiz submission
  const handleQuizSubmit = (e) => {
    e.preventDefault()
    setShowQuizResults(true)

    // Scroll to results
    setTimeout(() => {
      document.getElementById("quiz-results")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  // Add this function inside the component
  const handleLeadSubmit = async (email: string) => {
    try {
      // Store the email
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, source: "popup" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }

      // If it's a new subscriber, send a welcome email (if not handled by MailerLite)
      if (data.isNewSubscriber && !process.env.MAILERLITE_API_KEY) {
        const template = emailTemplates.welcome()
        await sendEmail(email, template)
      }

      // Store email in localStorage for later use
      localStorage.setItem("userEmail", email)

      return data
    } catch (error) {
      console.error("Error submitting lead:", error)
      throw error
    }
  }

  // Add this at the end of the component, just before the closing return tag
  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky Header */}
      <motion.header
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="font-bold text-xl">Content Creator Pro</div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="#how-it-works" className="text-sm hover:underline">
              How It Works
            </Link>
            <Link href="#whats-inside" className="text-sm hover:underline">
              What's Inside
            </Link>
            <Link href="#testimonials" className="text-sm hover:underline">
              Results
            </Link>
            <Link href="#faq" className="text-sm hover:underline">
              FAQ
            </Link>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white glow-red text-xs sm:text-sm px-2 sm:px-4"
              onClick={() => router.push("/checkout")}
            >
              GET INSTANT ACCESS
            </Button>
          </motion.div>
        </div>
        <Progress value={scrollProgress} className="h-1" aria-label="Reading progress" />
      </motion.header>

      <main className="flex-1">
        {/* Hero Section */}
        <motion.section
          className="py-12 md:py-20 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 overflow-hidden bg-grid-slate-100"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Badge className="px-3 py-1 text-sm bg-red-600 text-white">LIMITED TIME OFFER - 65% OFF</Badge>
              </motion.div>

              <motion.h1
                className="text-3xl md:text-5xl font-bold tracking-tighter max-w-3xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Stop Struggling to Stay Consistent on Social Media? Get Ready-to-Post Content & Watch Your Engagement
                Soar!
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground max-w-[800px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Never run out of content ideas again! Get 135+ proven templates that drive engagement, followers, and
                sales—even if you're not a natural content creator.
              </motion.p>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 max-w-[900px] mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md border border-blue-100">
                  <h3 className="font-bold text-blue-600 mb-1 flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    100 Viral Reels Templates
                  </h3>
                  <p className="text-sm">Copy-and-paste templates for Instagram Reels that drive massive engagement</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md border border-blue-100">
                  <h3 className="font-bold text-purple-600 mb-1 flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Carousel Post Templates
                  </h3>
                  <p className="text-sm">High-converting carousel designs that stop the scroll and drive saves</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md border border-blue-100">
                  <h3 className="font-bold text-indigo-600 mb-1 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    35 Threads Templates
                  </h3>
                  <p className="text-sm">Fill-in-the-blank templates for Threads that generate instant engagement</p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white text-base md:text-lg px-4 md:px-8 glow-red w-full sm:w-auto"
                  onClick={() => router.push("/checkout")}
                >
                  <span className="whitespace-normal text-center">
                    🛒 GET INSTANT ACCESS – TODAY ONLY! (<span className="line-through">$47</span> → $17)
                  </span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 glow-effect"
                  onClick={() => document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Play className="h-4 w-4" /> Read Success stories!
                </Button>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 text-sm text-muted-foreground mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Users className="h-4 w-4" />
                <span ref={liveCounterRef} className="animate-pulse">
                  12 people bought this in the last 20 minutes
                </span>
              </motion.div>

              <motion.div
                className="flex items-center gap-4 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  <span className="text-xs">Secure Checkout</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs">60-Day Money-Back Guarantee</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span className="text-xs">Instant Access</span>
                </div>
              </motion.div>
            </div>

            {/* Quick Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-red-600">1,200+</p>
                  <p className="text-sm text-muted-foreground">Creators Helped</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-red-600">78%</p>
                  <p className="text-sm text-muted-foreground">Increase in Engagement</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-red-600">135+</p>
                  <p className="text-sm text-muted-foreground">Ready-to-Use Templates</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-red-600">$47</p>
                  <p className="text-sm text-muted-foreground">Regular Value</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Problem → Solution Section */}
        <section className="py-12 bg-gradient-to-b from-white to-blue-50">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <motion.h2
                  className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  The Content Creation Struggles We Solve
                </motion.h2>
                <motion.ul
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {[
                    "Spending hours staring at a blank screen with no idea what to post?",
                    "Spending hours creating content that gets zero engagement?",
                    "Inconsistent posting schedule killing your algorithm reach?",
                    "Watching others go viral while your content falls flat?",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-2 p-3 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                      <p>"{item}"</p>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
              <div className="space-y-4">
                <motion.h2
                  className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  Our Ready-to-Post Solution
                </motion.h2>
                <motion.p
                  className="text-lg"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  The Content Creator Pro Bundle gives you:
                </motion.p>
                <motion.ul
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {[
                    {
                      title: "Done-for-You Content Templates",
                      desc: "135+ proven templates for Reels, Carousels, and Threads that you can customize in minutes.",
                      example:
                        "Example: Lifestyle creator increased engagement by 215% in 30 days using our Reels templates",
                    },
                    {
                      title: "Engagement-Optimized Formats",
                      desc: "Templates designed specifically to trigger the algorithm and maximize reach.",
                      example:
                        "Example: Business account went from 200 to 2,000 followers in 45 days with our carousel templates",
                    },
                    {
                      title: "Multi-Platform Compatibility",
                      desc: "Content that works across Instagram, Threads, and can be adapted for TikTok and YouTube Shorts.",
                      example:
                        "Example: Creator repurposed our templates across 3 platforms and tripled their content output",
                    },
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex flex-col gap-1 p-3 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <p>
                          <span className="font-bold">{item.title}:</span> {item.desc}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground ml-7 italic">{item.example}</p>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </div>
          </div>
        </section>
        {/* How It Works Section */}
        <motion.section id="how-it-works" className="py-12 md:py-20 bg-gradient-to-b from-blue-50 to-purple-50">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-red-600">
                How It Works: From Template to Viral Post
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Follow our simple 4-step system to transform your social media presence
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  step: 1,
                  title: "Choose Your Template",
                  description: "Browse our library of 135+ templates and select the one that fits your content goals.",
                  icon: FileText,
                },
                {
                  step: 2,
                  title: "Customize It",
                  description: "Add your unique perspective, niche-specific information, and personal touch.",
                  icon: Layout,
                },
                {
                  step: 3,
                  title: "Post & Engage",
                  description:
                    "Share your content at optimal times and use our engagement prompts to boost interaction.",
                  icon: Instagram,
                },
                {
                  step: 4,
                  title: "Watch Your Growth",
                  description: "Use our analytics guide to identify your best-performing content and double down.",
                  icon: TrendingUp,
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="relative overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                >
                  <div className="absolute top-0 left-0 w-8 h-8 bg-red-600 text-white flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <CardContent className="pt-10 p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-lg mb-6 max-w-2xl mx-auto">
                <span className="font-bold">Timeline:</span> Most users create their first batch of content within 24
                hours of purchase and see engagement improvements within the first week of posting.
              </p>
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white glow-red w-full sm:w-auto"
                onClick={() => router.push("/checkout")}
              >
                Get My Content Templates Now
              </Button>
            </div>
          </div>
        </motion.section>

        {/* What's Inside Section */}
        <section id="whats-inside" className="py-12 md:py-20 bg-gradient-to-b from-blue-50 to-indigo-50">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                WHAT'S INSIDE THE CONTENT CREATOR PRO BUNDLE
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your complete toolkit for creating engaging, high-performing content across Instagram and Threads
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-200 h-full shadow-lg hover:shadow-xl">
                  <div className="relative h-60 w-full">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jmNBTm1WfHuOtyl2vdlezPmI8ji4Ts.png"
                      alt="Reels Templates"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">$37 VALUE</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3">100 Viral Reels & Carousel Templates</h3>
                    <p className="mb-4">
                      Ready-to-use templates for creating engaging Instagram Reels and carousel posts that drive massive
                      engagement and follower growth.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <p>
                          <span className="font-bold">50 Reels script templates</span> that hook viewers in the first 3
                          seconds
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <p>
                          <span className="font-bold">50 carousel designs</span> that stop the scroll and drive massive
                          saves
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <p>
                          <span className="font-bold">Engagement prompts</span> to boost comments and shares on every
                          post
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <p>
                          <span className="font-bold">Customization guide</span> to make each template uniquely yours
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <p>
                          <span className="font-bold">Algorithm-friendly formats</span> that maximize your reach
                        </p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-200 h-full shadow-lg hover:shadow-xl">
                  <div className="relative h-60 w-full">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jmNBTm1WfHuOtyl2vdlezPmI8ji4Ts.png"
                      alt="Threads Templates"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">$27 VALUE</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3">Threads Authority: 35 Fill-in-the-Blank Templates</h3>
                    <p className="mb-4">
                      Instantly boost your Threads engagement with these proven templates that generate likes, comments,
                      and reposts.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <p>
                          <span className="font-bold">35 fill-in-the-blank templates</span> for instant engagement
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <p>
                          <span className="font-bold">Thread starters</span> that spark meaningful conversations
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <p>
                          <span className="font-bold">Viral hooks</span> that make people want to repost your content
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <p>
                          <span className="font-bold">Engagement questions</span> that generate 10x more comments
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <p>
                          <span className="font-bold">Posting schedule</span> to maximize your Threads algorithm reach
                        </p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Add the "Without Templates," "With Templates," and "After 30 Days" section */}
            <motion.div
              className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">WITHOUT TEMPLATES</p>
                  <p className="font-medium">Hours staring at a blank screen</p>
                  <p className="text-sm text-muted-foreground mt-2">Inconsistent posting, low engagement</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">WITH TEMPLATES</p>
                  <p className="font-medium">Content created in minutes</p>
                  <p className="text-sm text-muted-foreground mt-2">Consistent posting, high engagement</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">AFTER 30 DAYS</p>
                  <p className="font-medium">Accelerated follower growth</p>
                  <p className="text-sm text-muted-foreground mt-2">More reach, more opportunities</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="mt-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-2xl font-bold mb-4">
                Regular Price: <span className="text-red-600">$64</span>
              </p>
              <p className="text-3xl font-bold mb-6">
                Today's Price: <span className="text-red-600">JUST $17</span>
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 glow-red"
                  onClick={() => router.push("/checkout")}
                >
                  🛒 GET INSTANT ACCESS TO 135+ TEMPLATES NOW!
                </Button>
                <p className="text-sm mt-2 text-muted-foreground">Secure checkout • Instant delivery • 24/7 support</p>
              </motion.div>
            </motion.div>

            <motion.p
              className="mt-6 text-sm text-white/80 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              PS: You're getting 135+ proven templates for less than $0.13 each. What's the risk with our 60-day
              guarantee?
            </motion.p>
          </div>
        </section>

        {/* Real Results Section */}
        <section id="testimonials" className="py-12 bg-gradient-to-r from-slate-50 to-blue-50 bg-grid-slate-100">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                SEE HOW THESE TEMPLATES TRANSFORMED THEIR SOCIAL MEDIA
              </h2>
              <p className="text-lg text-muted-foreground">
                See what our students have achieved with these exact systems
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {[
                {
                  quote:
                    "These templates saved my content strategy! I went from posting once a week to 5x a week because it's so easy now. Using the Reels templates, my engagement is up 215% and I've gained over 2,000 new followers in just 45 days.",
                  author: "Sarah K., Lifestyle Creator",
                  image:
                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&h=150&auto=format&fit=crop",
                  metrics: "215% engagement increase • 2,000+ new followers • 5x weekly posts",
                },
                {
                  quote:
                    "As someone who always struggled with what to post, these templates have been a game-changer. My first Reel using template #28 got 22K views when I was averaging only 500 before! The carousel templates helped me get 3x more saves.",
                  author: "Mark J., Fitness Coach",
                  image:
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&h=150&auto=format&fit=crop",
                  metrics: "22K views on first template Reel • 44x increase in reach • 3x more saves",
                },
                {
                  quote:
                    "The Threads templates helped me grow from 200 to 3,500 followers in just 30 days. I'm getting more engagement there than on any other platform now, and it takes me minutes to create content with the fill-in-the-blank format.",
                  author: "Priya M., Business Consultant",
                  image:
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&h=150&auto=format&fit=crop",
                  metrics: "3,300+ new Threads followers • 78% engagement rate • 10+ viral threads",
                },
                {
                  quote:
                    "I used to spend 3-4 hours creating a single carousel post. Now I can make 5 high-quality posts in under an hour using these templates. My last carousel got over 2,000 saves and brought in 15 new clients to my business!",
                  author: "David L., Marketing Expert",
                  image:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&auto=format&fit=crop",
                  metrics: "2,000+ saves per carousel • 15 new clients • 80% time saved on content creation",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-100">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-blue-300">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.author}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{item.author}</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.2, delay: 0.1 * i }}
                              >
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="italic mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">{item.quote}</p>
                      <div className="bg-green-50 p-2 rounded-lg text-sm text-center border border-green-100">
                        <p className="font-medium">{item.metrics}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-lg mb-6">
                Join 5,400+ creators who are transforming their social media presence with our templates
              </p>
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white glow-red"
                onClick={() => router.push("/checkout")}
              >
                I Want These Results Too
              </Button>
            </div>

            {/* Backstory Section */}
            <div className="mt-16">
              <div className="max-w-3xl mx-auto">
                <motion.div
                  className="mb-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    How I Went From Content Burnout to Consistent Growth
                  </h2>
                </motion.div>

                <motion.div
                  className="prose prose-lg max-w-none"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 border border-blue-100">
                    <p className="text-lg font-medium text-blue-800 mb-4">
                      <span className="italic">
                        "I was spending 20+ hours a week creating content that barely got any engagement..."
                      </span>
                    </p>

                    <p className="mb-4">
                      Two years ago, I was struggling to grow my social media presence. I was posting regularly, but my
                      content wasn't getting the engagement I hoped for. I was spending hours staring at a blank screen,
                      trying to come up with ideas.
                    </p>

                    <p className="mb-4 font-bold text-red-600">
                      The worst part? I was watching other creators in my niche go viral with seemingly simple content
                      while my carefully crafted posts fell flat.
                    </p>

                    <p className="mb-4">
                      I was ready to give up until I discovered something that changed everything: successful creators
                      weren't reinventing the wheel with every post. They were using proven content frameworks and
                      templates.
                    </p>

                    <p className="mb-6">
                      That's when I had my <span className="font-bold">breakthrough moment</span>...
                    </p>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                      <p className="mb-2 font-medium">
                        I started documenting and reverse-engineering the most successful content formats across
                        Instagram and Threads:
                      </p>
                      <p className="text-lg font-bold text-blue-800">
                        I created a library of templates that consistently generated engagement, followers, and even
                        sales.
                      </p>
                    </div>

                    <p className="mb-4">The results were immediate and dramatic:</p>

                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <p>My content creation time dropped from 3-4 hours per post to just 20-30 minutes</p>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <p>My engagement rate increased by 215% in the first 30 days</p>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <p>I went from posting 2-3 times a week to posting daily without burnout</p>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <p>My follower growth accelerated from 100/month to 1,500+/month</p>
                      </li>
                    </ul>

                    <p className="mb-4">
                      The best part? I've now helped over 5,400 creators transform their social media presence using
                      these exact templates. Many of them were just like me: overwhelmed, inconsistent, and frustrated
                      with their lack of results.
                    </p>

                    <p className="text-lg font-bold text-blue-800">
                      If you're tired of the content creation hamster wheel, these templates will give you the structure
                      and inspiration you need to create engaging content consistently.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-12 bg-gradient-to-b from-blue-50 to-indigo-50">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                How We Compare
              </h2>
              <p className="text-muted-foreground">See why our templates outperform other content solutions</p>
            </div>

            <div className="overflow-x-auto rounded-lg shadow-xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-left bg-white">Features</th>
                    <th className="p-4 text-center bg-red-50 border-b-2 border-red-600">
                      <div className="font-bold">Content Creator Pro</div>
                      <div className="text-red-600 font-bold">$17</div>
                    </th>
                    <th className="p-4 text-center bg-white">
                      <div className="font-medium">Generic Content Calendars</div>
                      <div>$97-197</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      feature: "Ready-to-Use Templates",
                      ours: "135+ templates",
                      others: "30-50 ideas",
                    },
                    {
                      feature: "Platform-Specific Formats",
                      ours: true,
                      others: false,
                    },
                    {
                      feature: "Engagement Prompts",
                      ours: true,
                      others: "Limited",
                    },
                    {
                      feature: "Customization Guides",
                      ours: true,
                      others: false,
                    },
                    {
                      feature: "Algorithm-Optimized",
                      ours: true,
                      others: false,
                    },
                    {
                      feature: "Time to Create Content",
                      ours: "20-30 minutes",
                      others: "1-2 hours",
                      reversed: true,
                    },
                    {
                      feature: "Threads-Specific Templates",
                      ours: true,
                      others: false,
                    },
                    {
                      feature: "Money-Back Guarantee",
                      ours: "60 Days",
                      others: "30 Days or None",
                    },
                  ].map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                      <td className="p-4 font-medium">{item.feature}</td>
                      <td className="p-4 text-center">
                        {typeof item.ours === "boolean" ? (
                          item.ours ? (
                            <CheckCircle2
                              className={`h-5 w-5 mx-auto ${item.reversed ? "text-red-500" : "text-green-500"}`}
                            />
                          ) : (
                            <AlertCircle
                              className={`h-5 w-5 mx-auto ${item.reversed ? "text-green-500" : "text-red-500"}`}
                            />
                          )
                        ) : (
                          <span className={item.reversed ? "" : "font-medium"}>{item.ours}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {typeof item.others === "boolean" ? (
                          item.others ? (
                            <CheckCircle2
                              className={`h-5 w-5 mx-auto ${item.reversed ? "text-red-500" : "text-green-500"}`}
                            />
                          ) : (
                            <AlertCircle
                              className={`h-5 w-5 mx-auto ${item.reversed ? "text-green-500" : "text-red-500"}`}
                            />
                          )
                        ) : (
                          <span>{item.others}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white glow-red"
                onClick={() => router.push("/checkout")}
              >
                Get All 135+ Templates Now
              </Button>
            </div>
          </div>
        </section>

        {/* Common Myths Section */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-white to-blue-50">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                Common Myths About Content Creation
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Let's address some misconceptions about using templates for your social media content
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  myth: "Using templates makes my content look generic",
                  reality:
                    "Our templates are frameworks, not cookie-cutters. They provide the proven structure while you add your unique voice, examples, and perspective. Our customers consistently report that their content feels more authentic because they're not stressed about the format.",
                },
                {
                  myth: "I need to create original content from scratch to stand out",
                  reality:
                    "The most successful creators understand that content formats are universal. What makes content unique is your perspective and experience, not reinventing the wheel with every post. Our templates help you focus on your message, not the mechanics.",
                },
                {
                  myth: "Templates only work for certain niches",
                  reality:
                    "We have creators using our templates successfully across finance, fitness, business, lifestyle, fashion, education, parenting, tech, and dozens more niches. The templates are designed to be adaptable to any topic while maintaining the psychological triggers that drive engagement.",
                },
                {
                  myth: "I'll still spend hours creating content even with templates",
                  reality:
                    "Our customers report reducing their content creation time by 70-80%. Instead of staring at a blank screen, you'll have a proven framework to fill in. Many creators go from spending 3-4 hours per post to just 20-30 minutes while seeing better results.",
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-100"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-red-100 p-2 rounded-full mt-1">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">MYTH:</h3>
                        <p>{item.myth}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-full mt-1">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">REALITY:</h3>
                        <p>{item.reality}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Offer & Urgency Section */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-indigo-600 to-purple-700 text-white">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
                Stop Struggling with Content Creation – Start Growing Your Audience Today
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
                Your $17 investment today could transform your social media presence within days. The only question is:
                will you continue to struggle, or take action?
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-white/70 mb-1">WITHOUT TEMPLATES</p>
                    <p className="font-medium">Hours spent creating each post</p>
                    <p className="text-sm text-white/70 mt-2">Inconsistent results, low engagement</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-white/70 mb-1">WITH TEMPLATES</p>
                    <p className="font-medium">Content created in minutes</p>
                    <p className="text-sm text-white/70 mt-2">Consistent posting, high engagement</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-white/70 mb-1">AFTER 30 DAYS</p>
                    <p className="font-medium">Accelerated follower growth</p>
                    <p className="text-sm text-white/70 mt-2">More reach, more opportunities</p>
                  </CardContent>
                </Card>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 shadow-xl glow-red"
                  onClick={() => router.push("/checkout")}
                >
                  💸 GET 135+ READY-TO-USE TEMPLATES – JUST $17!
                </Button>
              </motion.div>
            </motion.div>
            <motion.p
              className="mt-6 text-sm text-white/80 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              PS: You're getting 135+ proven templates for less than $0.13 each. What's the risk with our 60-day
              guarantee?
            </motion.p>

            <motion.div
              className="flex justify-center space-x-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <CreditCard className="h-4 w-4" />
                <span className="text-xs">Secure SSL Checkout</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs">60-Day Guarantee</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <Users className="h-4 w-4" />
                <span className="text-xs">5,400+ Happy Customers</span>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Disclaimer Section */}
      <section className="py-8 bg-gray-100">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Disclaimer</h3>
            <div className="text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="mb-2">
                The results shared in the Content Creator Pro testimonials are not typical and will vary based on
                individual effort, skills, experience, and market conditions. The engagement and follower growth
                examples (such as "215% increase in engagement," "2,000+ new followers," or "22K views") are exceptional
                cases and should not be interpreted as average or guaranteed results.
              </p>
              <p className="mb-2">
                While we mention that most creators see results within 7-14 days and significant growth by day 30, your
                timeline may differ. The content creation strategies taught in this program require consistent
                implementation, and not everyone will achieve the same level of success or within the same timeframe.
              </p>
              <p className="mb-2">
                The Content Creator Pro templates are for educational purposes only and do not guarantee any specific
                outcome. All social media growth involves effort and consistency, and it is recommended that you conduct
                thorough research and due diligence before making any financial decisions.
              </p>
              <p>
                Our program is an independent training resource and is not affiliated with or endorsed by Instagram,
                Meta, Threads, or any other social media platform mentioned. By purchasing the Content Creator Pro
                templates, you acknowledge that you are responsible for your own content creation and outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <motion.footer
        className="border-t py-6 md:py-0 bg-gradient-to-r from-slate-900 to-blue-900 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-24 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-white/70">© 2024 Content Creator Pro. All rights reserved.</p>
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-4">
            <Link href="#" className="text-sm text-white/70 hover:text-white hover:underline transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-white/70 hover:text-white hover:underline transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-white/70 hover:text-white hover:underline transition-colors">
              Contact Us
            </Link>
          </div>
        </div>

        <div className="container mt-4 md:mt-2 flex justify-center space-x-6 pb-6">
          <Link href="#" className="text-white/70 hover:text-white transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
            <span className="sr-only">Facebook</span>
          </Link>
          <Link href="#" className="text-white/70 hover:text-white transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span className="sr-only">Instagram</span>
          </Link>
          <Link href="#" className="text-white/70 hover:text-white transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
            </svg>
            <span className="sr-only">Twitter</span>
          </Link>
        </div>
      </motion.footer>

      {/* Add the lead capture popup */}
      <LeadCapturePopup
        onClose={() => setShowLeadPopup(false)}
        onSubmit={handleLeadSubmit}
        delay={7000} // Show after 7 seconds
        exitIntent={true}
      />
    </div>
  )
}

