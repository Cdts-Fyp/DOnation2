"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface TestimonialCardProps {
  quote: string
  name: string
  role: string
  imageSrc: string
}

export default function TestimonialCard({ quote, name, role, imageSrc }: TestimonialCardProps) {
  return (
    <motion.div
      className="group rounded-xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl"
      variants={{
        hidden: { opacity: 0, y: 60 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: "easeOut" },
        },
      }}
    >
      <div className="mb-4 flex text-cyan-500">{"★".repeat(5)}</div>
      <div className="relative mb-6">
        <div className="absolute -left-2 -top-2 text-4xl text-cyan-200 opacity-50">"</div>
        <p className="relative z-10 italic text-gray-600">{quote}</p>
        <div className="absolute -bottom-2 -right-2 text-4xl text-cyan-200 opacity-50">"</div>
      </div>
      <div className="flex items-center">
        <div className="relative mr-4 h-14 w-14 overflow-hidden rounded-full border-2 border-cyan-100 transition-all duration-300 group-hover:border-cyan-300">
          {/* <Image src={imageSrc || "/images/avatar.jpg"} alt={name} fill className="object-cover" />
           */}
           <Image src="/images/avatar.jpg" alt={name} fill className="object-cover" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </motion.div>
  )
}
