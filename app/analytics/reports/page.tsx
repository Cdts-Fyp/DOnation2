"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  Filter,
  FileBarChart2,
  FileBarChart,
  PieChart,
  Check,
  Clock
} from "lucide-react"
import { getAllDonations } from "@/services/donation-service"
import { getAllPrograms } from "@/services/program-service"
import { getAllVolunteers } from "@/services/volunteer-service"
import { generateReport } from "@/services/report-service"
import { Donation, Program, Volunteer } from "@/types"

interface ReportType {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: "donations" | "programs" | "volunteers" | "general"
}

export default function ReportsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null)
  const [dateRange, setDateRange] = useState<string>("last30days")
  const [reportFormat, setReportFormat] = useState<string>("excel")
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router, user])
  
  // Load minimal data for basic count stats
  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true)
      try {
        await Promise.all([
          getAllDonations(),
          getAllPrograms(),
          getAllVolunteers()
        ])
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsDataLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Available reports
  const reportTypes: ReportType[] = [
    {
      id: "donation-summary",
      title: "Donation Summary",
      description: "Overview of all donations with totals, averages, and trends",
      icon: <FileBarChart className="h-5 w-5 text-cyan-600" />,
      category: "donations"
    },
    {
      id: "donor-activity",
      title: "Donor Activity",
      description: "Detailed breakdown of donor behavior and retention",
      icon: <PieChart className="h-5 w-5 text-cyan-600" />,
      category: "donations"
    },
    {
      id: "program-performance",
      title: "Program Performance",
      description: "Analysis of program fundraising success and impact",
      icon: <FileBarChart2 className="h-5 w-5 text-emerald-600" />,
      category: "programs"
    },
    {
      id: "program-expenses",
      title: "Program Expenses",
      description: "Breakdown of program costs and budget allocation",
      icon: <FileText className="h-5 w-5 text-emerald-600" />,
      category: "programs"
    },
  
    {
      id: "annual-report",
      title: "Annual Report",
      description: "Comprehensive yearly overview of all organizational activities",
      icon: <FileText className="h-5 w-5 text-violet-600" />,
      category: "general"
    }
  ]
  
  // Filter reports by category
  const filteredReports = activeCategory === "all" 
    ? reportTypes 
    : reportTypes.filter(report => report.category === activeCategory)
  
  // Date range options
  const dateRangeOptions = [
    { value: "last7days", label: "Last 7 Days" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "lastQuarter", label: "Last Quarter" },
    { value: "ytd", label: "Year to Date" },
    { value: "lastYear", label: "Last Year" },
    { value: "custom", label: "Custom Range" }
  ]
  
  // Report format options
  const formatOptions = [
    { value: "excel", label: "Excel Spreadsheet" },
  
  ]
  
  // Function to generate a report
  const handleGenerateReport = async () => {
    if (!selectedReport) return
    
    setIsGenerating(true)
    
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
            <p class="font-medium">Preparing your ${selectedReport.title}</p>
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
      
      await generateReport(selectedReport.id, dateRange, reportFormat);
      
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
      
    } finally {
      setIsGenerating(false);
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
        <span className="ml-3 text-gray-600">Loading reports...</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Generate Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate and download detailed reports for your organization
          </p>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 text-sm rounded-full border ${
              activeCategory === "all" 
                ? "bg-gray-900 text-white border-gray-900" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setActiveCategory("all")}
          >
            All Reports
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-full border ${
              activeCategory === "donations" 
                ? "bg-cyan-600 text-white border-cyan-600" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setActiveCategory("donations")}
          >
            Donations
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-full border ${
              activeCategory === "programs" 
                ? "bg-emerald-600 text-white border-emerald-600" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setActiveCategory("programs")}
          >
            Programs
          </button>
        
          <button
            className={`px-4 py-2 text-sm rounded-full border ${
              activeCategory === "general" 
                ? "bg-violet-600 text-white border-violet-600" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setActiveCategory("general")}
          >
            General
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Available Reports</h2>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredReports.map((report) => (
                <motion.div 
                  key={report.id}
                  variants={item}
                  className={`cursor-pointer rounded-lg border p-4 transition-all ${
                    selectedReport?.id === report.id 
                      ? 'bg-cyan-50 border-cyan-200 ring-1 ring-cyan-500' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">
                      {report.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {report.title}
                        {selectedReport?.id === report.id && (
                          <Check className="h-4 w-4 text-cyan-600 inline-block ml-2" />
                        )}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">{report.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
        
        {/* Report Configuration */}
        <div>
          <div className="sticky top-6">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Report Options</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline-block mr-1" />
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                  >
                    {dateRangeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4 inline-block mr-1" />
                    Report Format
                  </label>
                  <div className="space-y-2">
                    {formatOptions.map(option => (
                      <div key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          id={option.value}
                          name="format"
                          value={option.value}
                          checked={reportFormat === option.value}
                          onChange={(e) => setReportFormat(e.target.value)}
                          className="h-4 w-4 text-cyan-600 focus:ring-cyan-500"
                        />
                        <label htmlFor={option.value} className="ml-2 text-sm text-gray-700">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Generate Button */}
                <button
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={!selectedReport || isGenerating}
                  onClick={handleGenerateReport}
                >
                  {isGenerating ? (
                    <>
                      <Clock className="h-4 w-4 inline-block mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 inline-block mr-2" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
              
              {!selectedReport && (
                <div className="text-center text-sm text-gray-500 mt-4">
                  Select a report to generate
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Report Generation History (optional - could be implemented later) */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recently Generated Reports</h2>
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-400 mr-3" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">Donation Summary</div>
                <div className="text-xs text-gray-500">Generated yesterday</div>
              </div>
              <button 
                className="text-cyan-600 hover:text-cyan-800"
                onClick={() => handleGenerateReport()}
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-400 mr-3" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">Program Performance</div>
                <div className="text-xs text-gray-500">Generated 3 days ago</div>
              </div>
              <button 
                className="text-cyan-600 hover:text-cyan-800"
                onClick={() => handleGenerateReport()}
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 