"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Users, 
  DollarSign, 
  ArrowLeft,
  UserPlus,
  Repeat,
  TrendingUp,
  Banknote,
  Calendar
} from "lucide-react"
import { getAllDonations } from "@/services/donation-service"
import { Donation } from "@/types"

// Component to show donor retention over time
const DonorRetentionChart = ({ donations }: { donations: Donation[] }) => {
  // For demo purposes, we'll simulate retention data
  // In a real app, this would be calculated from actual historical data
  const retentionData = [
    { month: 'Jan', retention: 92 },
    { month: 'Feb', retention: 88 },
    { month: 'Mar', retention: 91 },
    { month: 'Apr', retention: 85 },
    { month: 'May', retention: 82 },
    { month: 'Jun', retention: 88 },
    { month: 'Jul', retention: 90 },
    { month: 'Aug', retention: 93 },
    { month: 'Sep', retention: 89 },
    { month: 'Oct', retention: 87 },
    { month: 'Nov', retention: 85 },
    { month: 'Dec', retention: 91 },
  ]
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">Previous 12 months</div>
        <div className="flex space-x-2 items-center">
          <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Donor Retention %</span>
        </div>
      </div>
      
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
        
        {/* Chart */}
        <div className="ml-10 h-full">
          {/* Horizontal grid lines */}
          <div className="absolute left-10 right-0 h-full flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-gray-100 w-full h-0"></div>
            ))}
          </div>
          
          {/* Line chart */}
          <svg className="w-full h-full" viewBox={`0 0 ${retentionData.length * 50} 100`} preserveAspectRatio="none">
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0" />
            </linearGradient>
            
            {/* Area under the line */}
            <path
              d={`
                M 0 ${100 - retentionData[0].retention}
                ${retentionData.map((d, i) => `L ${i * 50} ${100 - d.retention}`).join(' ')}
                L ${(retentionData.length - 1) * 50} 100
                L 0 100
                Z
              `}
              fill="url(#gradient)"
            />
            
            {/* Line */}
            <path
              d={`
                M 0 ${100 - retentionData[0].retention}
                ${retentionData.map((d, i) => `L ${i * 50} ${100 - d.retention}`).join(' ')}
              `}
              fill="none"
              stroke="rgb(6, 182, 212)"
              strokeWidth="2"
            />
            
            {/* Data points */}
            {retentionData.map((d, i) => (
              <circle
                key={i}
                cx={i * 50}
                cy={100 - d.retention}
                r="3"
                fill="white"
                stroke="rgb(6, 182, 212)"
                strokeWidth="2"
              />
            ))}
          </svg>
          
          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            {retentionData.map((d, i) => (
              <div key={i} style={{ width: '50px', textAlign: 'center' }}>{d.month}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// New vs returning donors component
const DonorSegmentationChart = ({ donations }: { donations: Donation[] }) => {
  // In a real app, we would calculate these values from the donation data
  const segments = [
    { label: 'First-time donors', value: 38, color: 'bg-cyan-500' },
    { label: 'Returning donors', value: 45, color: 'bg-emerald-500' },
    { label: 'Regular donors', value: 17, color: 'bg-amber-500' }
  ]
  
  return (
    <div className="space-y-6">
      {/* Pie chart (simplified version) */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Create the pie chart segments */}
            {(() => {
              let startAngle = 0;
              return segments.map((segment, index) => {
                const angle = (segment.value / 100) * 360;
                const endAngle = startAngle + angle;
                
                // Calculate the SVG arc path
                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                
                // Create the arc path
                const largeArcFlag = angle > 180 ? 1 : 0;
                const path = `
                  M 50 50
                  L ${x1} ${y1}
                  A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}
                  L 50 50
                `;
                
                const colorMap = {
                  'bg-cyan-500': '#06b6d4',
                  'bg-emerald-500': '#10b981',
                  'bg-amber-500': '#f59e0b'
                };
                
                const result = (
                  <path
                    key={index}
                    d={path}
                    fill={colorMap[segment.color as keyof typeof colorMap]}
                    stroke="white"
                    strokeWidth="1"
                  />
                );
                
                startAngle = endAngle;
                return result;
              });
            })()}
            
            {/* Center circle for donut effect */}
            <circle cx="50" cy="50" r="25" fill="white" />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">{donations.length}</span>
            <span className="text-xs text-gray-500">Total Donors</span>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="space-y-3">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${segment.color} mr-2`}></div>
            <div className="flex-1 text-sm text-gray-700">{segment.label}</div>
            <div className="text-sm font-medium text-gray-900">{segment.value}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Top donation days component (what days of the week people donate most)
const TopDonationDays = ({ donations }: { donations: Donation[] }) => {
  // Calculate donations by day of week
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const donationsByDay: { [key: string]: number } = {};
  
  // Initialize days of week with zero
  daysOfWeek.forEach(day => {
    donationsByDay[day] = 0;
  });
  
  // Count donations by day of week
  donations.forEach(donation => {
    const date = new Date(donation.date);
    const dayName = daysOfWeek[date.getDay()];
    donationsByDay[dayName] += 1;
  });
  
  // Convert to array and sort by count (descending)
  const sortedDays = Object.entries(donationsByDay)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => b.count - a.count);
  
  // Get max count for scaling
  const maxCount = Math.max(...sortedDays.map(d => d.count), 1);
  
  return (
    <div className="space-y-4">
      {sortedDays.map(({ day, count }) => {
        const widthPercentage = (count / maxCount) * 100;
        
        return (
          <div key={day} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{day}</span>
              <span className="text-gray-500">{count} donations</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 rounded-full" 
                style={{ width: `${Math.max(widthPercentage, 4)}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function DonorAnalyticsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [donations, setDonations] = useState<Donation[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  
  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router, user])
  
  // Load donation data
  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true)
      try {
        const allDonations = await getAllDonations()
        setDonations(allDonations)
      } catch (error) {
        console.error("Error loading donations data:", error)
      } finally {
        setIsDataLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Calculate donor metrics
  const uniqueDonorCount = new Set(donations.filter(d => !d.isAnonymous).map(d => d.donorId)).size
  const averageDonationAmount = donations.length > 0 
    ? donations.reduce((sum, donation) => sum + donation.amount, 0) / donations.length
    : 0
  const repeatDonorCount = (() => {
    const donorCounts = donations.reduce((counts, donation) => {
      if (!donation.isAnonymous) {
        counts[donation.donorId] = (counts[donation.donorId] || 0) + 1
      }
      return counts
    }, {} as {[key: string]: number})
    
    return Object.values(donorCounts).filter(count => count > 1).length
  })()
  
  // Monthly donor growth rate (simulated)
  const donorGrowthRate = 12.3
  
  // Stats for display
  const stats = [
    {
      title: "Total Donors",
      value: uniqueDonorCount,
      icon: <Users className="h-5 w-5 text-cyan-600" />,
    },
    {
      title: "Repeat Donors",
      value: repeatDonorCount,
      icon: <Repeat className="h-5 w-5 text-cyan-600" />,
    },
    {
      title: "New Donors (30 days)",
      value: Math.round(uniqueDonorCount * 0.2), // Simulated
      icon: <UserPlus className="h-5 w-5 text-cyan-600" />,
    },
    {
      title: "Avg. Donation",
      value: new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'PKR',
        maximumFractionDigits: 0 
      }).format(averageDonationAmount).replace('PKR', 'Rs.'),
      icon: <Banknote className="h-5 w-5 text-cyan-600" />,
    },
  ]
  
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
        <span className="ml-3 text-gray-600">Loading donor analytics...</span>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/analytics" className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donor Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Insights into donor behavior, demographics, and giving patterns
          </p>
        </div>
      </div>
      
      {/* Stats Overview */}
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
            <div className="flex items-center">
              <div className="rounded-full bg-cyan-50 p-3">{stat.icon}</div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donor Retention Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Donor Retention Rate</h2>
            <div className="flex items-center text-sm text-emerald-600 font-medium">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+{donorGrowthRate}% monthly</span>
            </div>
          </div>
          <DonorRetentionChart donations={donations} />
        </motion.div>
        
        {/* Donor Segmentation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Donor Segmentation</h2>
            <Link href="/analytics/reports" className="text-sm text-cyan-600 hover:text-cyan-700">
              View Report
            </Link>
          </div>
          <DonorSegmentationChart donations={donations} />
        </motion.div>
        
        {/* Top Donation Days */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Most Active Days</h2>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>By day of week</span>
            </div>
          </div>
          <TopDonationDays donations={donations} />
        </motion.div>
        
        {/* Donor Lifetime Value */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Donor Lifetime Value</h2>
            <Link href="/analytics/reports" className="text-sm text-cyan-600 hover:text-cyan-700">
              View Details
            </Link>
          </div>
          
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-5xl font-bold text-cyan-600">
                {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'PKR',
                  maximumFractionDigits: 0 
                }).format(15000).replace('PKR', 'Rs.')}
              </div>
              <p className="mt-2 text-sm text-gray-500">Average lifetime value per donor</p>
              <p className="mt-6 text-sm text-gray-700">
                Donors tend to contribute <span className="font-semibold">2.4 times</span> on average
                over their lifetime, with a <span className="font-semibold">68%</span> chance of making
                a second donation.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 