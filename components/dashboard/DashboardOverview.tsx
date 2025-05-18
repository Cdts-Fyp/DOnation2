"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react"
import DonationChart from "@/components/charts/DonationChart"
import CampaignProgress from "@/components/dashboard/CampaignProgress"
import RecentDonations from "@/components/dashboard/RecentDonations"
import UpcomingEvents from "@/components/dashboard/UpcomingEvents"

export default function DashboardOverview() {
  const stats = [
    {
      title: "Total Donations",
      value: "$24,320",
      change: "+12.5%",
      increasing: true,
      icon: <DollarSign className="h-5 w-5 text-cyan-600" />,
    },
    {
      title: "Active Donors",
      value: "1,429",
      change: "+5.2%",
      increasing: true,
      icon: <Users className="h-5 w-5 text-cyan-600" />,
    },
    {
      title: "Active Programs",
      value: "8",
      change: "+2",
      increasing: true,
      icon: <TrendingUp className="h-5 w-5 text-cyan-600" />,
    },
    {
      title: "Upcoming Events",
      value: "12",
      change: "-1",
      increasing: false,
      icon: <Calendar className="h-5 w-5 text-cyan-600" />,
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex space-x-2">
          <select className="select">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last 12 months</option>
          </select>
          <button className="btn btn-primary">Export Report</button>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-cyan-50 p-3">{stat.icon}</div>
              <span
                className={`flex items-center text-xs font-medium ${
                  stat.increasing ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change}
                {stat.increasing ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card overflow-hidden"
        >
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Donation Trends</h3>
          </div>
          <div className="p-6">
            <DonationChart />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card overflow-hidden"
        >
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Campaign Progress</h3>
          </div>
          <div className="p-6">
            <CampaignProgress />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card overflow-hidden lg:col-span-2"
        >
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Donations</h3>
          </div>
          <div className="p-6">
            <RecentDonations />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card overflow-hidden"
        >
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
          </div>
          <div className="p-6">
            <UpcomingEvents />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
