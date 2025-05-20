"use client"

import { useState, useEffect } from "react"
import { Briefcase, Plus, Search, Filter, ArrowUpDown, MoreHorizontal, Calendar, Users, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { getAllPrograms, getProgramsByStatus } from "@/services/program-service"
import { Program } from "@/types"

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<string>("startDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoading(true)
        
        let fetchedPrograms: Program[]
        
        if (statusFilter === "all") {
          fetchedPrograms = await getAllPrograms()
        } else {
          fetchedPrograms = await getProgramsByStatus(statusFilter as Program["status"])
        }
        
        setPrograms(fetchedPrograms)
      } catch (error) {
        console.error("Error fetching programs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPrograms()
  }, [statusFilter])
  
  // Filter and sort programs
  const filteredPrograms = programs
    .filter(program => {
      // Search filter
      const matchesSearch = 
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.manager.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesSearch
    })
    .sort((a, b) => {
      // Handle different sort fields
      let valueA: any
      let valueB: any
      
      switch (sortField) {
        case "title":
          valueA = a.title
          valueB = b.title
          break
        case "startDate":
          valueA = new Date(a.startDate).getTime()
          valueB = new Date(b.startDate).getTime()
          break
        case "endDate":
          valueA = new Date(a.endDate).getTime()
          valueB = new Date(b.endDate).getTime()
          break
        case "target":
          valueA = a.target
          valueB = b.target
          break
        case "raised":
          valueA = a.raised
          valueB = b.raised
          break
        case "volunteers":
          valueA = a.volunteers
          valueB = b.volunteers
          break
        default:
          valueA = a.title
          valueB = b.title
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
  
  const programStats = {
    total: programs.length,
    active: programs.filter(p => p.status === "active").length,
    draft: programs.filter(p => p.status === "draft").length,
    completed: programs.filter(p => p.status === "completed").length,
    totalRaised: programs.reduce((sum, p) => sum + p.raised, 0),
    totalVolunteers: programs.reduce((sum, p) => sum + p.volunteers, 0)
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program Management</h1>
          <p className="text-gray-500">Manage your charity's programs and campaigns</p>
        </div>
        {/* <Link
          href="/programs/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Program
        </Link> */}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-cyan-50 rounded-md">
              <Briefcase className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Programs</h2>
              <p className="text-2xl font-bold text-gray-900">{programStats.total}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500">{programStats.active} active</span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-xs text-gray-500">{programStats.draft} drafts</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-emerald-50 rounded-md">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Volunteers</h2>
              <p className="text-2xl font-bold text-gray-900">{programStats.totalVolunteers}</p>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-indigo-50 rounded-md">
              <DollarSign className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Funds Raised</h2>
              <p className="text-2xl font-bold text-gray-900">${programStats.totalRaised.toLocaleString()}</p>
              <div className="w-full mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600" 
                  style={{ 
                    width: `${Math.min(100, (programStats.totalRaised / programs.reduce((sum, p) => sum + p.target, 0)) * 100)}%` 
                  }}
                />
              </div>
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
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm"
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Programs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
            <Briefcase className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No programs found</h3>
            <p className="mt-1 text-gray-500">
              {searchQuery ? "Try adjusting your search or filters" : "Get started by creating a new program"}
            </p>
            {!searchQuery && (
              <Link
                href="/programs/new"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Program
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
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Program</span>
                      {sortField === "title" && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("startDate")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Start Date</span>
                      {sortField === "startDate" && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("endDate")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>End Date</span>
                      {sortField === "endDate" && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("raised")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Progress</span>
                      {sortField === "raised" && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("volunteers")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Volunteers</span>
                      {sortField === "volunteers" && (
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
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrograms.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-cyan-100 flex items-center justify-center text-cyan-600">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{program.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{program.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(program.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(program.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">${program.raised.toLocaleString()} of ${program.target.toLocaleString()}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {Math.round((program.raised / program.target) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (program.raised / program.target) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {program.volunteers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          program.status === "active"
                            ? "bg-green-100 text-green-800"
                            : program.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/programs/${program.id}`}
                          className="text-cyan-600 hover:text-cyan-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/programs/${program.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                      </div>
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

// Import here to avoid TypeScript errors
import { DollarSign } from "lucide-react" 