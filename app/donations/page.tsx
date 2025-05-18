"use client"

import { useState, useEffect } from "react"
import { 
  DollarSign, Plus, Search, Filter, ArrowUpDown, Check, X, ChevronRight
} from "lucide-react"
import Link from "next/link"
import { getAllDonations } from "@/services/donation-service"
import { getAllPrograms } from "@/services/program-service"
import { Donation, Program } from "@/types"

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [programFilter, setProgramFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<string>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch donations and programs in parallel
        const [fetchedDonations, fetchedPrograms] = await Promise.all([
          getAllDonations(),
          getAllPrograms()
        ])
        
        setDonations(fetchedDonations)
        setPrograms(fetchedPrograms)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Find program title by ID
  const getProgramTitle = (programId: string) => {
    const program = programs.find(p => p.id === programId)
    return program ? program.title : "Unknown Program"
  }
  
  // Filter and sort donations
  const filteredDonations = donations
    .filter(donation => {
      // Search filter
      const matchesSearch = 
        donation.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (donation.note?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      
      // Status filter
      const matchesStatus = statusFilter === "all" || donation.status === statusFilter
      
      // Program filter
      const matchesProgram = programFilter === "all" || donation.programId === programFilter
      
      return matchesSearch && matchesStatus && matchesProgram
    })
    .sort((a, b) => {
      // Handle different sort fields
      let valueA: any
      let valueB: any
      
      switch (sortField) {
        case "donorName":
          valueA = a.donorName
          valueB = b.donorName
          break
        case "amount":
          valueA = a.amount
          valueB = b.amount
          break
        case "date":
          valueA = new Date(a.date).getTime()
          valueB = new Date(b.date).getTime()
          break
        case "program":
          valueA = getProgramTitle(a.programId)
          valueB = getProgramTitle(b.programId)
          break
        default:
          valueA = new Date(a.date).getTime()
          valueB = new Date(b.date).getTime()
      }
      
      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const totalAmount = filteredDonations.reduce((sum, donation) => sum + donation.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donations Management</h1>
          <p className="text-gray-500">Track and manage all donations to your programs</p>
        </div>
       
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-cyan-50 rounded-md">
              <DollarSign className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Donations</h2>
              <p className="text-2xl font-bold text-gray-900">{filteredDonations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-emerald-50 rounded-md">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Amount</h2>
              <p className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
            </div>
          </div>
          </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-indigo-50 rounded-md">
              <DollarSign className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Average Donation</h2>
              <p className="text-2xl font-bold text-gray-900">
                ${filteredDonations.length ? Math.round(totalAmount / filteredDonations.length).toLocaleString() : '0'}
              </p>
            </div>
          </div>
          </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search donations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
              >
                <option value="all">All Programs</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.title}
                  </option>
                ))}
              </select>
                  </div>
                </div>
              </div>
            </div>
      
      {/* Donations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                  </div>
        ) : filteredDonations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
            <DollarSign className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No donations found</h3>
            <p className="mt-1 text-gray-500">
              {searchQuery || statusFilter !== 'all' || programFilter !== 'all' 
                ? "Try adjusting your search or filters" 
                : "Start by recording a new donation"}
            </p>
            {!searchQuery && statusFilter === 'all' && programFilter === 'all' && (
              <Link
                href="/donations/new"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Record Donation
              </Link>
            )}
                  </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("donorName")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Donor</span>
                      {sortField === "donorName" && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("program")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Program</span>
                      {sortField === "program" && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                  </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Amount</span>
                      {sortField === "amount" && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                  </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      {sortField === "date" && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Payment Method
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {donation.isAnonymous ? "Anonymous" : donation.donorName}
                  </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getProgramTitle(donation.programId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${donation.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(donation.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          donation.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : donation.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {donation.status === "completed" ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : donation.status === "pending" ? (
                          <div className="h-3 w-3 mr-1 rounded-full bg-yellow-400" />
                        ) : (
                          <X className="h-3 w-3 mr-1" />
                        )}
                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donation.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/donations/${donation.id}`}
                        className="text-cyan-600 hover:text-cyan-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
    </div>
  )
}
