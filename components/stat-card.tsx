"use client"

import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface StatCardProps {
  icon: LucideIcon
  value: string
  label: string
}

export default function StatCard({ icon: Icon, value, label }: StatCardProps) {
  return (
    <motion.div
      className="group rounded-xl bg-white p-6 text-center shadow-sm transition-all duration-300 hover:shadow-xl"
      variants={{
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.5 },
        },
      }}
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-600 transition-all duration-300 group-hover:from-cyan-200 group-hover:to-blue-200">
        <Icon size={32} />
      </div>
      <h3 className="mb-2 text-4xl font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">{value}</h3>
      <p className="text-gray-600">{label}</p>
    </motion.div>
  )
}
