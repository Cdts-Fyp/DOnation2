"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

interface FeaturedProgramCardProps {
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

export default function FeaturedProgramCard({
  title,
  description,
  category,
  imageSrc,
  imageAlt,
  progress,
  goal,
  raised,
  slug,
}: FeaturedProgramCardProps) {
  return (
    <motion.div
      className="group overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
      variants={{
        hidden: { opacity: 0, y: 60 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: "easeOut" },
        },
      }}
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>
        <div className="absolute top-4 right-4 rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold text-white">
          {category}
        </div>
      </div>
      <div className="p-6">
        <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">{title}</h3>
        <p className="mb-4 text-gray-600 line-clamp-2">{description}</p>
        <div className="mb-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="font-bold text-cyan-600">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Goal: ${goal.toLocaleString()}</span>
          <span>Raised: ${raised.toLocaleString()}</span>
        </div>
        <Link
          href={`/programs/${slug}`}
          className="mt-6 inline-flex items-center gap-2 font-medium text-cyan-600 hover:text-cyan-700 transition-colors"
        >
          Learn More <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  )
}
