"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle,
  Activity 
} from "lucide-react"
import DonationChart from "@/components/charts/DonationChart"
import CampaignProgress from "@/components/dashboard/CampaignProgress"
import RecentDonations from "@/components/dashboard/RecentDonations"
import UpcomingEvents from "@/components/dashboard/UpcomingEvents"
import Link from "next/link"
import { getAllDonations } from "@/services/donation-service"
import { getAllPrograms, getProgramsByStatus } from "@/services/program-service"
import { getAllVolunteers } from "@/services/volunteer-service"
import { Donation, Program, Volunteer } from "@/types"

export default function AdminDashboard() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [activePrograms, setActivePrograms] = useState<Program[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalStats, setTotalStats] = useState({
    totalDonations: 0,
    donorsCount: 0,
    programsCount: 0,
    volunteersCount: 0,
  })
  
  // Load all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [allDonations, allPrograms, activeProgramsData, allVolunteers] = await Promise.all([
          getAllDonations(),
          getAllPrograms(),
          getProgramsByStatus('active'),
          getAllVolunteers()
        ])
        
        setDonations(allDonations)
        setPrograms(allPrograms)
        setActivePrograms(activeProgramsData)
        setVolunteers(allVolunteers)
        
        // Calculate stats
        const uniqueDonors = new Set(allDonations.map(d => d.donorId)).size
        const totalDonationAmount = allDonations.reduce((sum, donation) => sum + donation.amount, 0)
        
        setTotalStats({
          totalDonations: totalDonationAmount,
          donorsCount: uniqueDonors,
          programsCount: allPrograms.length,
          volunteersCount: allVolunteers.length
        })
        
      } catch (error) {
        console.error("Error loading admin dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('PKR', 'Rs.')
  }
  
  // Calculate monthly growth rate (simplified for this example)
  const calculateGrowth = (data: any[]) => {
    if (data.length < 2) return { value: "0%", increasing: true }
    
    const thisMonth = data.slice(0, Math.ceil(data.length / 2)).length
    const lastMonth = data.slice(Math.ceil(data.length / 2)).length
    
    if (lastMonth === 0) return { value: "100%", increasing: true }
    
    const growthRate = ((thisMonth - lastMonth) / lastMonth) * 100
    return { 
      value: `${Math.abs(growthRate).toFixed(1)}%`, 
      increasing: growthRate >= 0
    }
  }
  
  // Stats for display
  const stats = [
    {
      title: "Total Donations",
      value: formatCurrency(totalStats.totalDonations),
      change: calculateGrowth(donations).value,
      increasing: calculateGrowth(donations).increasing,
      icon: <DollarSign className="h-5 w-5 text-cyan-600" />,
    },
    {
      title: "Active Donors",
      value: totalStats.donorsCount.toString(),
      change: calculateGrowth(donations.map(d => d.donorId)).value,
      increasing: calculateGrowth(donations.map(d => d.donorId)).increasing,
      icon: <Users className="h-5 w-5 text-cyan-600" />,
    },
    {
      title: "Active Programs",
      value: activePrograms.length.toString(),
      change: `${activePrograms.length - (programs.length - activePrograms.length)}`,
      increasing: activePrograms.length > (programs.length - activePrograms.length),
      icon: <TrendingUp className="h-5 w-5 text-cyan-600" />,
    },
    {
      title: "Volunteers",
      value: totalStats.volunteersCount.toString(),
      change: calculateGrowth(volunteers).value,
      increasing: calculateGrowth(volunteers).increasing,
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

  // Find programs that need attention (less than 30% funded)
  const programsNeedingAttention = programs
    .filter(program => (program.raised / program.target) < 0.3 && program.status === 'active')
    .sort((a, b) => (a.raised / a.target) - (b.raised / b.target))
    .slice(0, 3)

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">
      <div className="text-cyan-600">Loading admin dashboard data...</div>
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your organization's activities and monitor performance</p>
        </div>
        <div className="flex space-x-2">
          <select className="select">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last 12 months</option>
          </select>
          {/* <button className="btn btn-primary">Export Report</button>   */}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card overflow-hidden lg:col-span-2"
        >
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Donation Trends</h3>
          </div>
          <div className="p-6">
            <DonationChart realData={donations} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card overflow-hidden"
        >
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Programs Needing Attention</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {programsNeedingAttention.length > 0 ? (
                programsNeedingAttention.map((program) => {
                  const percentage = Math.round((program.raised / program.target) * 100)
                  
                  return (
                    <div key={program.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{program.title}</h4>
                          <span className="text-xs font-medium text-red-500 flex items-center">
                            <AlertTriangle size={12} className="mr-1" /> Low funding
                          </span>
                        </div>
                        {/* <Link 
                          href={`/admin/programs/${program.id}`}
                          className="text-xs font-medium text-cyan-600 hover:text-cyan-800"
                        >
                          Manage
                        </Link> */}
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <motion.div
                          className={`h-full bg-red-500`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">{percentage}% Funded</span>
                        <span className="text-xs font-medium text-gray-500">
                          {formatCurrency(program.raised)} of {formatCurrency(program.target)}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-10 w-10 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600">All programs are well-funded!</p>
                </div>
              )}
            </div>
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
          <div className="border-b border-gray-200 p-6 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Donations</h3>
            {/* <Link href="/admin/donations" className="text-sm text-cyan-600 hover:text-cyan-800">
              View All
            </Link> */}
          </div>
          <div className="p-6">
            <RecentDonations realData={donations.slice(0, 5)} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card overflow-hidden"
        >
          <div className="border-b border-gray-200 p-6 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Campaign Progress</h3>
            {/* <Link href="/admin/programs" className="text-sm text-cyan-600 hover:text-cyan-800">
              View All
            </Link> */}
          </div>
          <div className="p-6">
            <CampaignProgress realData={activePrograms.slice(0, 3)} />
          </div>
        </motion.div>
      </div>
    </div>
  )
} 