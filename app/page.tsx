"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Heart, Users, Globe, TrendingUp, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/navbar"
import StatCard from "@/components/stat-card"
import TestimonialCard from "@/components/testimonial-card"
import { useAuth } from "@/contexts/auth-context"
import AdminDashboard from "@/components/dashboard/AdminDashboard"
import UserDashboard from "@/components/dashboard/UserDashboard"


type FeaturedProgramCardProps = {
  title: string
  description: string
  category: string
  imageSrc: string
  imageAlt: string
  progress: number
  goal: number
  raised: number
  slug: string
}

function FeaturedProgramCard({ title, description, category, imageSrc, imageAlt, progress, goal, raised, slug }: FeaturedProgramCardProps) {
  return (
    <motion.div  className="group relative">
      <div className="relative flex flex-col items-center">
        {/* Circular Progress Container */}
        <div className="relative mb-6">
          {/* Outer circle with progress */}
          <div className="relative h-64 w-64">
            {/* Background circle */}
            <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>

            {/* Progress circle */}
            <svg className="absolute inset-0 h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="#E2E8F0" strokeWidth="4" />
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeDasharray={`${progress * 3.02} 302`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0891B2" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>
            </svg>

            {/* Image container */}
            <div className="absolute inset-2 overflow-hidden rounded-full border-2 border-white shadow-lg">
              <Image
                src={imageSrc || "/placeholder.svg?height=240&width=240"}
                alt={imageAlt}
                width={240}
                height={240}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Progress percentage */}
            <div className="absolute bottom-0 right-0 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg border-2 border-cyan-50">
              <div className="text-center">
                <span className="block text-lg font-bold text-cyan-700">{progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <span className="inline-block mb-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800">
            {category}
          </span>
          <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
          <p className="mb-4 text-gray-600 line-clamp-2">{description}</p>

          {/* Donation info */}
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-500">
              <span className="font-bold text-cyan-700">Rs. {(raised / 1000).toFixed(1)}k</span> raised of Rs.
              {(goal / 1000).toFixed(1)}k goal
            </p>
          </div>

          <Link
            href={`/programs/${slug}`}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-medium text-white transition-all hover:from-cyan-600 hover:to-blue-700"
          >
            Donate Now <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const featuredProgramsRef = useRef(null)
  const testimonialsRef = useRef(null)

  // Show loading state when checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-cyan-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    )
  }

  // If user is authenticated, render the appropriate dashboard instead of landing page
  if (isAuthenticated) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
      </motion.div>
    )
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  // Show landing page for unauthenticated users
  return (
    <div className="overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 pb-24">
        {/* Background Video or Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/90 to-blue-900/90 z-10"></div>
          <Image src="/images/world-map.png" alt="World Map Background" fill className="object-cover" priority />
        </div>

        {/* Animated Particles */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div
            className="absolute h-4 w-4 rounded-full bg-cyan-300 animate-float"
            style={{ top: "20%", left: "10%" }}
          ></div>
          <div
            className="absolute h-3 w-3 rounded-full bg-blue-300 animate-float-delay"
            style={{ top: "60%", left: "15%" }}
          ></div>
          <div
            className="absolute h-5 w-5 rounded-full bg-cyan-200 animate-float-slow"
            style={{ top: "30%", left: "80%" }}
          ></div>
          <div
            className="absolute h-2 w-2 rounded-full bg-blue-200 animate-float"
            style={{ top: "70%", left: "75%" }}
          ></div>
          <div
            className="absolute h-3 w-3 rounded-full bg-cyan-100 animate-float-delay"
            style={{ top: "40%", left: "45%" }}
          ></div>
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <motion.div className="max-w-3xl" initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.span
                className="inline-block mb-4 rounded-full bg-cyan-400/20 px-4 py-1.5 text-sm font-medium text-cyan-100"
                variants={fadeInUp}
              >
                Empowering Communities Worldwide
              </motion.span>
              <motion.h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl text-white" variants={fadeInUp}>
                Make a Difference{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Today</span>
              </motion.h1>
              <motion.p className="mb-8 text-xl text-cyan-100 leading-relaxed" variants={fadeInUp}>
                Join our global community of donors making a positive impact on the world. Every donation brings hope
                and changes lives.
              </motion.p>
              <motion.div className="flex flex-wrap gap-4" variants={fadeInUp}>
                <Link
                  href="/programs"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-medium text-white transition-all hover:from-cyan-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/30"
                >
                  Explore Programs <ArrowRight size={18} />
                </Link>
                <Link
                  href="/donations/new"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  Donate Now
                </Link>
              </motion.div>

              <motion.div className="mt-12 flex items-center gap-6" variants={fadeInUp}>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-cyan-900 overflow-hidden">
                      <Image
                        // src={`/images/testimonial-${i}.jpg`}
                        src="/images/avatar.jpg"
                        alt={`Donor ${i}`}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-cyan-900 bg-cyan-600 text-xs font-bold text-white">
                    +2K
                  </div>
                </div>
                <div className="text-cyan-100">
                  <p>
                    Joined by <span className="font-bold text-white">2,000+</span> donors
                  </p>
                  <div className="flex items-center text-yellow-400 text-sm">
                    {"★".repeat(5)} <span className="ml-1 text-cyan-100">(4.9/5)</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden md:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl"></div>
                <div className="relative rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-1 backdrop-blur-sm">
                  <div className="rounded-lg overflow-hidden">
                    <Image
                      src="/images/people-helping.jpg"
                      alt="People helping in community"
                      width={600}
                      height={700}
                      className="rounded-lg object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 rounded-lg bg-white p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-2 text-green-600">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Raised</p>
                      <p className="text-xl font-bold text-gray-900">Rs. 2.4M+</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-6 top-1/4 rounded-lg bg-white p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                      <Globe size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Countries</p>
                      <p className="text-xl font-bold text-gray-900">28</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="fill-white">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6 },
              },
            }}
          >
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Our Global Impact</h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-lg">
              Through the generosity of our donors, we've been able to make a significant difference in communities
              worldwide.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <StatCard icon={Heart} value="Rs. 2.4M+" label="Total Donations" />

            <StatCard icon={Users} value="15,000+" label="Active Donors" />

            <StatCard icon={Globe} value="28" label="Countries Reached" />

            <StatCard icon={TrendingUp} value="120+" label="Active Programs" />
          </motion.div>
        </div>
      </section>

      {/* Featured Programs */}
      <section className="bg-gray-50 py-20" ref={featuredProgramsRef}>
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <span className="inline-block mb-2 rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-800">
              Featured Programs
            </span>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Make an Impact Today</h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-lg">
              Discover our most impactful initiatives that are changing lives around the world.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <FeaturedProgramCard
              title="Clean Water Initiative"
              description="Providing clean water access to communities facing water scarcity and contamination issues."
              category="Clean Water"
              imageSrc="https://lh5.googleusercontent.com/proxy/4mDCeD-iTQTTz7IvE2jYMD811M4Obqe6aEbRu2GbkXGlsLATdLIVJV_twIpA88Qfod2qJSCbxZf30CYrST88pReXR-b89jiwbt--BxYAhMIZ-ZJ0"
              imageAlt="Clean Water Initiative"
              progress={68}
              goal={120000}
              raised={81600}
              slug="clean-water-initiative"
            />

            <FeaturedProgramCard
              title="Education for All"
              description="Supporting educational opportunities for underprivileged children across developing nations."
              category="Education"
              imageSrc="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdFMjJgiVNmun7V0x1JY4wkQIczRH59ndUhw&s"
              imageAlt="Education for All"
              progress={82}
              goal={200000}
              raised={164000}
              slug="education-for-all"
            />

            <FeaturedProgramCard
              title="Healthcare Access"
              description="Expanding medical services to remote areas and providing essential healthcare equipment."
              category="Healthcare"
              imageSrc="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMZCy5fzYudmSihI2FP4YygwoMlMV1OTI4Nw&s"
              imageAlt="Healthcare Access"
              progress={45}
              goal={150000}
              raised={67500}
              slug="healthcare-access"
            />
          </motion.div>

          <motion.div
            className="mt-12 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-cyan-600 shadow-md transition-all hover:bg-cyan-50 hover:shadow-lg"
            >
              View All Programs <ChevronRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white" ref={testimonialsRef}>
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <span className="inline-block mb-2 rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-800">
              Testimonials
            </span>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">What Our Donors Say</h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-lg">
              Hear from people who have experienced the joy of giving and making a difference.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <TestimonialCard
              quote="I've been donating monthly to the Clean Water Initiative for two years now. The transparency and impact reports make me confident my contributions are making a real difference."
              name="Sarah J."
              role="Monthly Donor"
              imageSrc="/images/testimonial-1.jpg"
            />

            <TestimonialCard
              quote="As a business owner, I wanted to give back in a meaningful way. Partnering with this platform has allowed us to support education programs with incredible outcomes."
              name="Michael T."
              role="Corporate Partner"
              imageSrc="/images/testimonial-2.jpg"
            />

            <TestimonialCard
              quote="The user experience is exceptional. I can easily track my donations, see the impact, and connect with causes I care about. This platform has made giving a joy."
              name="Elena R."
              role="Regular Donor"
              imageSrc="/images/testimonial-3.jpg"
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-700 to-blue-700"></div>
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/world-pattern.png" alt="World Pattern" fill className="object-cover" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">Ready to Make an Impact?</h2>
            <p className="mb-8 text-lg text-cyan-100">
              Join thousands of donors who are changing lives through their contributions. Every donation, no matter the
              size, brings hope and creates positive change.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-cyan-700 transition-all hover:bg-gray-100 hover:shadow-lg"
              >
                Create Account <ChevronRight size={18} />
              </Link>
              <Link
                href="/donations/new"
                className="inline-flex items-center gap-2 rounded-full bg-transparent border-2 border-white px-6 py-3 font-medium text-white transition-all hover:bg-white/10"
              >
                Donate Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
