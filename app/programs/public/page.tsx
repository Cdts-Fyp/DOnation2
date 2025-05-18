"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Search, Filter, Tag, Calendar, DollarSign, Heart
} from "lucide-react"
import { getAllPrograms } from "@/services/program-service"
import { Program } from "@/types"
import Link from "next/link"

export default function PublicProgramsPage() {
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoading(true)
        
        const fetchedPrograms = await getAllPrograms()
        // Only show active programs to the public
        const activePrograms = fetchedPrograms.filter(
          program => program.status === "active"
        )
        
        setPrograms(activePrograms)
        setFilteredPrograms(activePrograms)
      } catch (error) {
        console.error("Error fetching programs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPrograms()
  }, [])
  
  useEffect(() => {
    // Filter programs whenever search query or category changes
    const filtered = programs.filter(program => {
      const matchesSearch = 
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = categoryFilter === "all" || program.category === categoryFilter
      
      return matchesSearch && matchesCategory
    })
    
    setFilteredPrograms(filtered)
  }, [searchQuery, categoryFilter, programs])
  
  // Extract unique categories for filter dropdown
  const categories = ["all", ...new Set(programs.map(program => program.category))]
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
        <p className="mt-2 text-lg text-gray-600">
          Support our programs and help make a difference in the community
        </p>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm"
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="relative">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-lg"
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c !== "all").map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Programs Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="mt-2 text-lg font-medium text-gray-900">No programs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrograms.map(program => (
            <div 
              key={program.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Program Image */}
              <div className="h-48 overflow-hidden relative">
                {program.imageUrl ? (
                  <img 
                    src={program.imageUrl} 
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                {program.isFeatured && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                    Featured
                  </div>
                )}
              </div>
              
              {/* Program Content */}
              <div className="p-5">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Tag className="h-3 w-3 mr-1" />
                  <span>{program.category}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    Ends {new Date(program.endDate).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {program.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {program.shortDescription || program.description.substring(0, 150)}
                </p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900">
                      Rs. {program.raised.toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      of Rs. {program.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (program.raised / program.target) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Tags */}
                {program.tags && program.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {program.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag} 
                        className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {program.tags.length > 3 && (
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        +{program.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Link 
                    href={`/programs/public/${program.id}`}
                    className="flex-1 inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                  >
                    Learn More
                  </Link>
                  <Link 
                    href={`/my-donations/new?programId=${program.id}`}
                    className="flex-1 inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Donate
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 