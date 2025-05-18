"use client"

import { useState, useEffect } from "react"
import { 
  Briefcase, ArrowLeft, MapPin, Calendar, 
  Users, DollarSign, Search, Filter, ChevronRight 
} from "lucide-react"
import Link from "next/link"
import { getAllPrograms } from "@/services/program-service"
import { Program } from "@/types"

export default function ProgramDetailsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoading(true)
        
        // Fetch programs from Firestore
        const fetchedPrograms = await getAllPrograms()
        setPrograms(fetchedPrograms)
      } catch (error) {
        console.error("Error fetching programs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPrograms()
  }, [])
  
  // Filter programs based on search query
  const filteredPrograms = programs.filter(program => 
    program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.manager.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program Details</h1>
          <p className="text-gray-500">View and manage all your program details</p>
        </div>
        <Link
          href="/programs/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
        >
          Create Program
        </Link>
      </div>
      
      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="relative">
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
      </div>
      
      {/* Programs List */}
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
              {searchQuery ? "Try adjusting your search" : "Get started by creating a new program"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPrograms.map((program) => (
              <div key={program.id} className="p-6 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-md bg-cyan-100 flex items-center justify-center text-cyan-600">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{program.title}</h3>
                      <p className="mt-1 text-gray-500 text-sm">{program.description}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {program.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-3">
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
                    <Link
                      href={`/programs/${program.id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-cyan-700 bg-cyan-100 hover:bg-cyan-200"
                    >
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 