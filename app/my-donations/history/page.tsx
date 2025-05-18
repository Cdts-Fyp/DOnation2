"use client"

import { useState, useEffect } from "react"
import { User, DollarSign, Calendar, ChevronDown, ArrowUpDown, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getDonationsByDonor } from "@/services/donation-service"
import { getProgramById } from "@/services/program-service"
import { Donation, Program } from "@/types"
import Link from "next/link"

type EnhancedDonation = Donation & {
  program?: Program
}

export default function DonationHistoryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [donations, setDonations] = useState<EnhancedDonation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<"date" | "amount" | "programTitle">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterProgramId, setFilterProgramId] = useState<string | null>(null)
  const [uniquePrograms, setUniquePrograms] = useState<Program[]>([])
  
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    
    const loadDonations = async () => {
      try {
        setIsLoading(true)
        const userDonations = await getDonationsByDonor(user.id)
        
        // Enhance donations with program details
        const enhancedDonations: EnhancedDonation[] = []
        const programsMap = new Map<string, Program>()
        const uniqueProgramsList: Program[] = []
        
        for (const donation of userDonations) {
          let program: Program | undefined
          
          if (programsMap.has(donation.programId)) {
            program = programsMap.get(donation.programId)
          } else {
            const fetchedProgram = await getProgramById(donation.programId)
            if (fetchedProgram) {
              program = fetchedProgram
              programsMap.set(donation.programId, fetchedProgram)
              uniqueProgramsList.push(fetchedProgram)
            }
          }
          
          enhancedDonations.push({
            ...donation,
            program
          })
        }
        
        setDonations(enhancedDonations)
        setUniquePrograms(uniqueProgramsList)
      } catch (error) {
        console.error("Error loading donations:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadDonations()
  }, [user, router])
  
  const toggleSort = (field: "date" | "amount" | "programTitle") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }
  
  const filteredDonations = donations.filter(donation => {
    // Filter by program if selected
    if (filterProgramId && donation.programId !== filterProgramId) {
      return false
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        donation.program?.title.toLowerCase().includes(searchLower) ||
        donation.donorName.toLowerCase().includes(searchLower) ||
        (donation.donorEmail && donation.donorEmail.toLowerCase().includes(searchLower)) ||
        (donation.message && donation.message.toLowerCase().includes(searchLower)) ||
        donation.id.toLowerCase().includes(searchLower)
      )
    }
    
    return true
  })
  
  // Sort donations based on current sort settings
  const sortedDonations = [...filteredDonations].sort((a, b) => {
    let comparison = 0
    
    switch (sortField) {
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case "amount":
        comparison = a.amount - b.amount
        break
      case "programTitle":
        comparison = (a.program?.title || "").localeCompare(b.program?.title || "")
        break
    }
    
    return sortDirection === "asc" ? comparison : -comparison
  })
  
  const getTotalDonated = (): number => {
    return donations.reduce((sum, donation) => sum + donation.amount, 0)
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Donation History</h1>
      <p className="text-gray-600 mb-8">Track and manage all your donations in one place.</p>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="bg-cyan-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Donated</h2>
              <p className="text-2xl font-bold text-gray-900">Rs. {getTotalDonated().toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="bg-cyan-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Donations</h2>
              <p className="text-2xl font-bold text-gray-900">{donations.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="bg-cyan-100 p-3 rounded-full">
              <User className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Programs Supported</h2>
              <p className="text-2xl font-bold text-gray-900">{uniquePrograms.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and filter controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search donations..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative inline-block w-full md:w-64">
          <select
            className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            value={filterProgramId || ""}
            onChange={(e) => setFilterProgramId(e.target.value || null)}
          >
            <option value="">All Programs</option>
            {uniquePrograms.map(program => (
              <option key={program.id} value={program.id}>
                {program.title}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        
        <Link 
          href="/my-donations/new"
          className="inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
        >
          Make New Donation
        </Link>
      </div>
      
      {/* Donations table */}
      {sortedDonations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No donations found</h3>
          <p className="text-gray-500 mb-6">You haven't made any donations yet or none match your current filters.</p>
          <Link 
            href="/programs/public"
            className="inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            Browse Programs
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm overflow-hidden border border-gray-100 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("date")}
                >
                  <div className="flex items-center">
                    <span>Date</span>
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("programTitle")}
                >
                  <div className="flex items-center">
                    <span>Program</span>
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("amount")}
                >
                  <div className="flex items-center">
                    <span>Amount</span>
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDonations.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(donation.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {donation.program?.title || "Unknown Program"}
                    </div>
                    {donation.isAnonymous && (
                      <div className="text-xs text-gray-500">
                        Anonymous donation
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Rs. {donation.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link
                      href={`/programs/public/${donation.programId}`}
                      className="text-cyan-600 hover:text-cyan-900"
                    >
                      View Program
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 