"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  BarChart4, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download,
  FileBarChart,
  UserCheck,
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  HeartHandshake,
  BarChart2,
  FileText,
  ChevronRight
} from "lucide-react"
import { getAllDonations } from "@/services/donation-service"
import { getAllPrograms, getProgramsByStatus } from "@/services/program-service"
import { getAllVolunteers } from "@/services/volunteer-service"
import { Donation, Program, Volunteer } from "@/types"
import { generateReport } from "@/services/report-service"

// Custom chart component for monthly donation trends
const MonthlyDonationChart = ({ donations }: { donations: Donation[] }) => {
  // Process donations data to get monthly totals for the past 12 months
  const getMonthlyData = () => {
    const now = new Date()
    const monthlyTotals: { [key: string]: number } = {}
    
    // Initialize past 12 months with zero values
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`
      monthlyTotals[monthKey] = 0
    }
    
    // Sum up donations by month
    donations.forEach(donation => {
      const date = new Date(donation.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
      if (monthlyTotals.hasOwnProperty(monthKey)) {
        monthlyTotals[monthKey] += donation.amount
      }
    })
    
    return {
      labels: Object.keys(monthlyTotals).map(key => {
        const [year, month] = key.split('-')
        return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(month) - 1]} ${year}`
      }),
      data: Object.values(monthlyTotals)
    }
  }
  
  const { labels, data } = getMonthlyData()
  
  // Find max value for scaling
  const maxValue = Math.max(...data, 1)
  
  return (
    <div className="w-full h-64">
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2 items-center">
          <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Monthly Donations</span>
        </div>
        <div className="text-xs text-gray-500">Last 12 Months</div>
      </div>
      
      <div className="relative h-56">
        {/* Y-axis */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
          <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(maxValue).replace('PKR', 'Rs.')}</span>
          <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(maxValue/2).replace('PKR', 'Rs.')}</span>
          <span>Rs.0</span>
        </div>
        
        {/* Chart */}
        <div className="pl-16 h-full flex items-end space-x-2">
          {data.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-cyan-500 rounded-t-sm hover:bg-cyan-600 transition-all duration-300"
                style={{ 
                  height: `${Math.max((value / maxValue) * 100, 4)}%`,
                  minHeight: '4px'
                }}
              ></div>
              <span className="text-[9px] text-gray-500 mt-1 rotate-45 origin-left">{labels[index]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Component to show program distribution by category
const ProgramCategoryDistribution = ({ programs }: { programs: Program[] }) => {
  // Count programs by category
  const categoryCounts: { [key: string]: number } = {}
  programs.forEach(program => {
    categoryCounts[program.category] = (categoryCounts[program.category] || 0) + 1
  })
  
  // Sort by count (descending)
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) // Top 5 categories
  
  const totalCount = sortedCategories.reduce((sum, [_, count]) => sum + count, 0)
  
  // Generate random colors for categories
  const colors = [
    'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 
    'bg-rose-500', 'bg-violet-500', 'bg-blue-500'
  ]
  
  return (
    <div className="space-y-4">
      {sortedCategories.map(([category, count], index) => {
        const percentage = Math.round((count / totalCount) * 100)
        return (
          <div key={category} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{category}</span>
              <span className="text-gray-500">{count} ({percentage}%)</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${colors[index % colors.length]}`} 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Component to show distribution of donation amounts
const DonationAmountDistribution = ({ donations }: { donations: Donation[] }) => {
  // Define donation amount ranges
  const ranges = [
    { min: 0, max: 1000, label: 'Less than Rs.1,000' },
    { min: 1000, max: 5000, label: 'Rs.1,000 - Rs.5,000' },
    { min: 5000, max: 10000, label: 'Rs.5,000 - Rs.10,000' },
    { min: 10000, max: 50000, label: 'Rs.10,000 - Rs.50,000' },
    { min: 50000, max: Infinity, label: 'More than Rs.50,000' }
  ]
  
  // Count donations by range
  const rangeCounts = ranges.map(range => {
    const count = donations.filter(d => d.amount >= range.min && d.amount < range.max).length
    return { ...range, count }
  })
  
  const totalCount = donations.length
  
  return (
    <div className="space-y-4">
      {rangeCounts.map((range, index) => {
        const percentage = totalCount > 0 ? Math.round((range.count / totalCount) * 100) : 0
        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{range.label}</span>
              <span className="text-gray-500">{range.count} ({percentage}%)</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Top donors component
const TopDonors = ({ donations }: { donations: Donation[] }) => {
  // Group donations by donor and calculate total amount donated
  const donorTotals: { [key: string]: { id: string, name: string, total: number, count: number } } = {}
  
  donations.forEach(donation => {
    if (!donation.isAnonymous) {
      if (!donorTotals[donation.donorId]) {
        donorTotals[donation.donorId] = {
          id: donation.donorId,
          name: donation.donorName,
          total: 0,
          count: 0
        }
      }
      donorTotals[donation.donorId].total += donation.amount
      donorTotals[donation.donorId].count += 1
    }
  })
  
  // Sort by total amount and get top 5
  const topDonors = Object.values(donorTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
  
  return (
    <div className="space-y-4">
      {topDonors.map((donor, index) => (
        <div key={donor.id} className="flex items-center">
          <div className="w-8 h-8 flex items-center justify-center bg-cyan-100 text-cyan-800 rounded-full mr-3">
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-800">{donor.name}</div>
            <div className="text-xs text-gray-500">{donor.count} donations</div>
          </div>
          <div className="font-medium text-gray-800">
            {new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'PKR',
              maximumFractionDigits: 0 
            }).format(donor.total).replace('PKR', 'Rs.')}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [donations, setDonations] = useState<Donation[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [activePrograms, setActivePrograms] = useState<Program[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("month")
  const [reportType, setReportType] = useState("donations")
  
  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router, user])
  
  // Load all data
  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true)
      try {
        const [allDonations, allPrograms, activeProgs, allVolunteers] = await Promise.all([
          getAllDonations(),
          getAllPrograms(),
          getProgramsByStatus('active'),
          getAllVolunteers()
        ])
        
        setDonations(allDonations)
        setPrograms(allPrograms)
        setActivePrograms(activeProgs)
        setVolunteers(allVolunteers)
      } catch (error) {
        console.error("Error loading analytics data:", error)
      } finally {
        setIsDataLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Calculate stats
  const totalDonationsAmount = donations.reduce((sum, donation) => sum + donation.amount, 0)
  const uniqueDonors = new Set(donations.filter(d => !d.isAnonymous).map(d => d.donorId)).size
  const averageDonationAmount = donations.length > 0 ? totalDonationsAmount / donations.length : 0
  
  // Calculate growth rates
  const calculateGrowth = (data: any[], property?: string) => {
    if (data.length === 0) return { value: "0%", isPositive: true, raw: 0 }
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || a.joinedDate).getTime()
      const dateB = new Date(b.date || b.createdAt || b.joinedDate).getTime()
      return dateA - dateB
    })
    
    const halfIndex = Math.floor(sortedData.length / 2)
    
    // Calculate total values for first and second half
    let firstHalfValue = 0
    let secondHalfValue = 0
    
    if (property) {
      firstHalfValue = sortedData.slice(0, halfIndex).reduce((sum, item) => sum + item[property], 0)
      secondHalfValue = sortedData.slice(halfIndex).reduce((sum, item) => sum + item[property], 0)
    } else {
      firstHalfValue = sortedData.slice(0, halfIndex).length
      secondHalfValue = sortedData.slice(halfIndex).length
    }
    
    // Avoid division by zero
    if (firstHalfValue === 0) {
      return { value: secondHalfValue > 0 ? "100%" : "0%", isPositive: true, raw: 100 }
    }
    
    // Calculate growth rate
    const growthRate = ((secondHalfValue - firstHalfValue) / firstHalfValue) * 100
    
    return { 
      value: `${Math.abs(growthRate).toFixed(1)}%`, 
      isPositive: growthRate >= 0,
      raw: growthRate
    }
  }
  
  // Calculate stats
  const donationGrowth = calculateGrowth(donations, 'amount')
  const donorGrowth = calculateGrowth(donations.filter(d => !d.isAnonymous).map(d => ({ date: d.date, id: d.donorId })))
  const programGrowth = calculateGrowth(programs)
  const volunteerGrowth = calculateGrowth(volunteers)
  
  // Stats for display
  const stats = [
    {
      title: "Total Donations",
      value: new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'PKR',
        maximumFractionDigits: 0 
      }).format(totalDonationsAmount).replace('PKR', 'Rs.'),
      change: donationGrowth.value,
      isPositive: donationGrowth.isPositive,
      icon: <DollarSign className="h-5 w-5 text-cyan-600" />,
    },
    {
      title: "Active Donors",
      value: uniqueDonors,
      change: donorGrowth.value,
      isPositive: donorGrowth.isPositive,
      icon: <Users className="h-5 w-5 text-cyan-600" />,
    },
    {
      title: "Active Programs",
      value: activePrograms.length,
      change: programGrowth.value,
      isPositive: programGrowth.isPositive,
      icon: <TrendingUp className="h-5 w-5 text-cyan-600" />,
    },
    {
      title: "Average Donation",
      value: new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'PKR',
        maximumFractionDigits: 0 
      }).format(averageDonationAmount).replace('PKR', 'Rs.'),
      change: volunteerGrowth.value,
      isPositive: volunteerGrowth.isPositive,
      icon: <Activity className="h-5 w-5 text-cyan-600" />,
    },
  ]
  
  // Function to generate reports
  const handleExportReport = async () => {
    let reportId = 'donation-summary';
    let dateRange = 'last30days';
    
    switch (timeRange) {
      case 'week':
        dateRange = 'last7days';
        break;
      case 'month':
        dateRange = 'last30days';
        break;
      case 'quarter':
        dateRange = 'lastQuarter';
        break;
      case 'year':
        dateRange = 'lastYear';
        break;
      default:
        dateRange = 'last30days';
    }
    
    try {
      // Show toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-cyan-600 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-slideInRight';
      toast.style.animationDuration = '0.3s';
      toast.innerHTML = `
        <div class="flex items-center">
          <div class="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
            </svg>
          </div>
          <div>
            <p class="font-medium">Preparing Report</p>
            <p class="text-sm opacity-90">Please wait while we generate your report...</p>
          </div>
        </div>
        <style>
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-slideInRight {
            animation-name: slideInRight;
          }
        </style>
      `;
      
      document.body.appendChild(toast);
      
      await generateReport(reportId, dateRange, 'excel');
      
      // Update toast for success
      toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
      toast.innerHTML = `
        <div class="flex items-center">
          <div class="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
          </div>
          <div>
            <p class="font-medium">Success!</p>
            <p class="text-sm opacity-90">Your report is downloading now</p>
          </div>
        </div>
      `;
      
      // Remove toast after 3 seconds
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);
    } catch (error) {
      console.error("Error generating report:", error);
      
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
      errorToast.innerHTML = `
        <div class="flex items-center">
          <div class="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div>
            <p class="font-medium">Error</p>
            <p class="text-sm opacity-90">Failed to generate report</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(errorToast);
      
      // Remove error toast after 4 seconds
      setTimeout(() => {
        document.body.removeChild(errorToast);
      }, 4000);
    }
  }
  
  // Animation variants
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
  
  if (isLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
        <span className="ml-3 text-gray-600">Loading analytics data...</span>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive insights on donations, programs, and volunteer activities
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <select 
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <button 
            className="px-4 py-2 bg-cyan-600 text-white rounded-md text-sm flex items-center hover:bg-cyan-700"
            onClick={handleExportReport}
          >
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </button>
        </div>
      </div>
      
      {/* Analytics Overview Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8"
      >
        {stats.map((stat) => (
          <motion.div 
            key={stat.title} 
            variants={item} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-cyan-50 p-3">{stat.icon}</div>
              <span
                className={`flex items-center text-xs font-medium ${
                  stat.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change}
                {stat.isPositive ? (
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
      
      {/* Main Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Donation Trends Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Donation Trends</h2>
              <div className="text-sm text-gray-500">Monthly overview</div>
            </div>
            <MonthlyDonationChart donations={donations} />
          </motion.div>
          
          {/* Program Category Distribution */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Program Categories</h2>
              <Link href="/analytics/reports" className="text-sm text-cyan-600 hover:text-cyan-700">
                View Details
              </Link>
            </div>
            <ProgramCategoryDistribution programs={programs} />
          </motion.div>
          
          {/* Donation Amount Distribution */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Donation Amount Distribution</h2>
              <Link href="/analytics/reports" className="text-sm text-cyan-600 hover:text-cyan-700">
                View Details
              </Link>
            </div>
            <DonationAmountDistribution donations={donations} />
          </motion.div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button 
                className="flex w-full items-center justify-between p-3 text-sm font-medium bg-gray-50 rounded-md hover:bg-gray-100"
                onClick={() => router.push('/analytics/reports')}
              >
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-cyan-600 mr-2" />
                  Generate Custom Report
                </div>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </button>
              
              <button 
                className="flex w-full items-center justify-between p-3 text-sm font-medium bg-gray-50 rounded-md hover:bg-gray-100"
                onClick={async () => {
                  try {
                    // Show toast notification
                    const toast = document.createElement('div');
                    toast.className = 'fixed top-4 right-4 bg-cyan-600 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-slideInRight';
                    toast.style.animationDuration = '0.3s';
                    toast.innerHTML = `
                      <div class="flex items-center">
                        <div class="mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
                          </svg>
                        </div>
                        <div>
                          <p class="font-medium">Preparing Donation Report</p>
                          <p class="text-sm opacity-90">Please wait while we generate your report...</p>
                        </div>
                      </div>
                      <style>
                        @keyframes slideInRight {
                          from { transform: translateX(100%); opacity: 0; }
                          to { transform: translateX(0); opacity: 1; }
                        }
                        .animate-slideInRight {
                          animation-name: slideInRight;
                        }
                      </style>
                    `;
                    
                    document.body.appendChild(toast);
                    
                    await generateReport('donation-summary', 
                      timeRange === 'week' ? 'last7days' : 
                      timeRange === 'month' ? 'last30days' : 
                      timeRange === 'quarter' ? 'lastQuarter' : 
                      timeRange === 'year' ? 'lastYear' : 'last30days', 
                      'excel');
                      
                    // Update toast for success
                    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
                    toast.innerHTML = `
                      <div class="flex items-center">
                        <div class="mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </div>
                        <div>
                          <p class="font-medium">Success!</p>
                          <p class="text-sm opacity-90">Your report is downloading now</p>
                        </div>
                      </div>
                    `;
                    
                    // Remove toast after 3 seconds
                    setTimeout(() => {
                      document.body.removeChild(toast);
                    }, 3000);
                  } catch (error) {
                    console.error("Error exporting donation report:", error);
                  }
                }}
              >
                <div className="flex items-center">
                  <Download className="h-4 w-4 text-cyan-600 mr-2" />
                  Export Donation Report
                </div>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </button>
              
              <button 
                className="flex w-full items-center justify-between p-3 text-sm font-medium bg-gray-50 rounded-md hover:bg-gray-100"
                onClick={async () => {
                  try {
                    // Show toast notification
                    const toast = document.createElement('div');
                    toast.className = 'fixed top-4 right-4 bg-cyan-600 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-slideInRight';
                    toast.style.animationDuration = '0.3s';
                    toast.innerHTML = `
                      <div class="flex items-center">
                        <div class="mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
                          </svg>
                        </div>
                        <div>
                          <p class="font-medium">Preparing Program Report</p>
                          <p class="text-sm opacity-90">Please wait while we generate your report...</p>
                        </div>
                      </div>
                      <style>
                        @keyframes slideInRight {
                          from { transform: translateX(100%); opacity: 0; }
                          to { transform: translateX(0); opacity: 1; }
                        }
                        .animate-slideInRight {
                          animation-name: slideInRight;
                        }
                      </style>
                    `;
                    
                    document.body.appendChild(toast);
                    
                    await generateReport('program-performance', 
                      timeRange === 'week' ? 'last7days' : 
                      timeRange === 'month' ? 'last30days' : 
                      timeRange === 'quarter' ? 'lastQuarter' : 
                      timeRange === 'year' ? 'lastYear' : 'last30days', 
                      'excel');
                      
                    // Update toast for success
                    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
                    toast.innerHTML = `
                      <div class="flex items-center">
                        <div class="mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </div>
                        <div>
                          <p class="font-medium">Success!</p>
                          <p class="text-sm opacity-90">Your program report is downloading now</p>
                        </div>
                      </div>
                    `;
                    
                    // Remove toast after 3 seconds
                    setTimeout(() => {
                      document.body.removeChild(toast);
                    }, 3000);
                  } catch (error) {
                    console.error("Error exporting program report:", error);
                  }
                }}
              >
                <div className="flex items-center">
                  <Download className="h-4 w-4 text-cyan-600 mr-2" />
                  Export Program Report
                </div>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </button>
              
              <button 
                className="flex w-full items-center justify-between p-3 text-sm font-medium bg-gray-50 rounded-md hover:bg-gray-100"
                onClick={async () => {
                  try {
                    // Show toast notification
                    const toast = document.createElement('div');
                    toast.className = 'fixed top-4 right-4 bg-cyan-600 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-slideInRight';
                    toast.style.animationDuration = '0.3s';
                    toast.innerHTML = `
                      <div class="flex items-center">
                        <div class="mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
                          </svg>
                        </div>
                        <div>
                          <p class="font-medium">Preparing Donor Report</p>
                          <p class="text-sm opacity-90">Please wait while we generate your report...</p>
                        </div>
                      </div>
                      <style>
                        @keyframes slideInRight {
                          from { transform: translateX(100%); opacity: 0; }
                          to { transform: translateX(0); opacity: 1; }
                        }
                        .animate-slideInRight {
                          animation-name: slideInRight;
                        }
                      </style>
                    `;
                    
                    document.body.appendChild(toast);
                    
                    await generateReport('donor-activity', 
                      timeRange === 'week' ? 'last7days' : 
                      timeRange === 'month' ? 'last30days' : 
                      timeRange === 'quarter' ? 'lastQuarter' : 
                      timeRange === 'year' ? 'lastYear' : 'last30days', 
                      'excel');
                      
                    // Update toast for success
                    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
                    toast.innerHTML = `
                      <div class="flex items-center">
                        <div class="mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </div>
                        <div>
                          <p class="font-medium">Success!</p>
                          <p class="text-sm opacity-90">Your donor report is downloading now</p>
                        </div>
                      </div>
                    `;
                    
                    // Remove toast after 3 seconds
                    setTimeout(() => {
                      document.body.removeChild(toast);
                    }, 3000);
                  } catch (error) {
                    console.error("Error exporting donor report:", error);
                  }
                }}
              >
                <div className="flex items-center">
                  <Download className="h-4 w-4 text-cyan-600 mr-2" />
                  Export Donor Report
                </div>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </motion.div>
          
          {/* Top Donors */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Top Donors</h2>
              <Link href="/analytics/donors" className="text-sm text-cyan-600 hover:text-cyan-700">
                View All
              </Link>
            </div>
            <TopDonors donations={donations} />
          </motion.div>
          
          {/* Analytics Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-6">Analytics Sections</h2>
            <div className="space-y-3">
              <Link href="/analytics/donors" className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50">
                <div className="bg-rose-100 p-2 rounded-md mr-3">
                  <HeartHandshake className="h-5 w-5 text-rose-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Donor Analytics</div>
                  <div className="text-xs text-gray-500">Donor behavior and retention insights</div>
                </div>
              </Link>
              
              <Link href="/analytics/reports" className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50">
                <div className="bg-violet-100 p-2 rounded-md mr-3">
                  <BarChart2 className="h-5 w-5 text-violet-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Program Reports</div>
                  <div className="text-xs text-gray-500">Program performance and impact</div>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 