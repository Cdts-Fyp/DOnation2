"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Heart, Calendar, DollarSign, Award, ArrowUpRight, Clock } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getDonationsByDonor } from "@/services/donation-service"
import { getAllPrograms, getProgramsByStatus } from "@/services/program-service"
import { Donation, Program } from "@/types"
import DonationChart from "@/components/charts/DonationChart"

export default function UserDashboard() {
  const { user } = useAuth()
  const [userDonations, setUserDonations] = useState<Donation[]>([])
  const [activePrograms, setActivePrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalStats, setTotalStats] = useState({
    totalDonated: 0,
    donationCount: 0,
    lastDonationDate: null as Date | null,
    favoriteCause: "",
  })
  
  // Load user-specific data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      setIsLoading(true)
      try {
        const [userDonationsData, activeProgramsData] = await Promise.all([
          getDonationsByDonor(user.id),
          getProgramsByStatus('active')
        ])
        
        setUserDonations(userDonationsData)
        setActivePrograms(activeProgramsData)
        
        // Calculate statistics
        const totalAmount = userDonationsData.reduce((sum, donation) => sum + donation.amount, 0)
        
        // Find favorite cause (most donated to program)
        const programDonations = userDonationsData.reduce((acc, donation) => {
          acc[donation.programId] = (acc[donation.programId] || 0) + donation.amount
          return acc
        }, {} as Record<string, number>)
        
        const favProgramId = Object.entries(programDonations).sort((a, b) => b[1] - a[1])[0]?.[0] || ""
        
        // Get last donation date
        const sortedDonations = [...userDonationsData].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        
        setTotalStats({
          totalDonated: totalAmount,
          donationCount: userDonationsData.length,
          lastDonationDate: sortedDonations[0]?.date ? new Date(sortedDonations[0].date) : null,
          favoriteCause: favProgramId,
        })
        
      } catch (error) {
        console.error("Error loading user dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (user) {
      fetchData()
    }
  }, [user])
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('PKR', 'Rs.')
  }
  
  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return 'Never'
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }
  
  // Get program name by ID
  const getProgramName = (programId: string) => {
    const program = activePrograms.find(p => p.id === programId)
    return program?.title || 'Unknown Program'
  }

  // Find recommended programs based on user's donation history
  const getRecommendedPrograms = () => {
    if (!user || userDonations.length === 0) {
      return activePrograms.slice(0, 3)
    }
    
    // Get categories user has donated to
    const donatedPrograms = userDonations.map(d => d.programId)
    const userProgramsData = activePrograms.filter(p => donatedPrograms.includes(p.id))
    const categories = new Set(userProgramsData.map(p => p.category))
    
    // Find other active programs in those categories the user hasn't donated to yet
    const recommendations = activePrograms.filter(
      p => categories.has(p.category) && !donatedPrograms.includes(p.id)
    )
    
    // If we don't have enough recommendations, add other active programs
    if (recommendations.length < 3) {
      const additional = activePrograms
        .filter(p => !recommendations.includes(p) && !donatedPrograms.includes(p.id))
        .slice(0, 3 - recommendations.length)
        
      return [...recommendations, ...additional].slice(0, 3)
    }
    
    return recommendations.slice(0, 3)
  }
  
  const recommendedPrograms = getRecommendedPrograms()

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">
      <div className="text-cyan-600">Loading your dashboard data...</div>
    </div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Donor Dashboard</h1>
        <p className="text-gray-500">Track your donation activity and impact</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-full bg-cyan-50 p-3">
              <DollarSign className="h-5 w-5 text-cyan-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Total Donated</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(totalStats.totalDonated)}</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-full bg-indigo-50 p-3">
              <Heart className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Donations Made</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totalStats.donationCount}</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-full bg-amber-50 p-3">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Favorite Cause</h3>
            <p className="mt-2 text-xl font-bold text-gray-900 truncate">
              {totalStats.favoriteCause ? getProgramName(totalStats.favoriteCause) : 'Not determined yet'}
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-full bg-emerald-50 p-3">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Last Donation</h3>
            <p className="mt-2 text-xl font-bold text-gray-900">{formatDate(totalStats.lastDonationDate)}</p>
          </div>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card overflow-hidden"
        >
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Your Donation History</h3>
          </div>
          <div className="p-6">
            <DonationChart realData={userDonations} />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card overflow-hidden"
        >
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Recommended Programs</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {recommendedPrograms.length > 0 ? (
                recommendedPrograms.map((program) => {
                  const percentage = Math.round((program.raised / program.target) * 100)
                  
                  return (
                    <div key={program.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{program.title}</h4>
                          <span className="text-xs text-gray-500">{program.category}</span>
                        </div>
                        <Link 
                          href={`/programs/${program.id}`}
                          className="text-xs font-medium text-cyan-600 hover:text-cyan-800"
                        >
                          Donate
                        </Link>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <motion.div
                          className={`h-full bg-cyan-500`}
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
                  <Clock className="h-10 w-10 text-cyan-500 mx-auto mb-2" />
                  <p className="text-gray-600">No recommendations available</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="card overflow-hidden">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Your Recent Donations</h3>
          <Link href="/my-donations" className="text-sm text-cyan-600 hover:text-cyan-800">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500">
                <th className="pb-3 pl-4 pr-3">Program</th>
                <th className="pb-3 px-3">Amount</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userDonations.slice(0, 5).map((donation, index) => {
                const program = activePrograms.find(p => p.id === donation.programId)
                
                return (
                  <motion.tr
                    key={donation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="text-sm text-gray-900"
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 font-medium">{program?.title || 'Unknown Program'}</td>
                    <td className="whitespace-nowrap px-3 py-4 font-medium text-cyan-600">{formatCurrency(donation.amount)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-gray-500">{formatDate(new Date(donation.date))}</td>
                    <td className="whitespace-nowrap px-3 py-4">
                      <span className="badge badge-success">{donation.status}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right">
                      <Link href={`/programs/${donation.programId}`} className="text-cyan-600 hover:text-cyan-700">
                        Donate Again <ArrowUpRight className="inline h-3 w-3" />
                      </Link>
                    </td>
                  </motion.tr>
                )
              })}
              
              {userDonations.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    You haven't made any donations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 