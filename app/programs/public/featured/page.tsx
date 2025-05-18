"use client"

import { useState, useEffect } from "react"
import { 
  Search, Filter, Tag, Calendar, DollarSign, Heart, Star 
} from "lucide-react"
import { getFeaturedPrograms } from "@/services/program-service"
import { Program } from "@/types"
import Link from "next/link"

export default function FeaturedProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoading(true)
        const fetchedPrograms = await getFeaturedPrograms()
        setPrograms(fetchedPrograms)
      } catch (error) {
        console.error("Error fetching featured programs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPrograms()
  }, [])
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center">
          <Star className="h-8 w-8 text-amber-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Featured Programs</h1>
        </div>
        <p className="mt-2 text-lg text-gray-600">
          Our highlighted programs that need your support the most
        </p>
      </div>
      
      {/* Programs Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : programs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="mt-2 text-lg font-medium text-gray-900">No featured programs available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Check back later or explore our <Link href="/programs/public" className="text-cyan-600 hover:text-cyan-800">all programs</Link> page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map(program => (
            <div 
              key={program.id} 
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {/* Program Image */}
              <div className="h-52 overflow-hidden relative">
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
                <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                  Featured
                </div>
              </div>
              
              {/* Program Content */}
              <div className="p-6">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Tag className="h-3 w-3 mr-1" />
                  <span>{program.category}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    Ends {new Date(program.endDate).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
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
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full" 
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
                <div className="flex space-x-3 mt-2">
                  <Link 
                    href={`/programs/public/${program.id}`}
                    className="flex-1 inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                  >
                    Learn More
                  </Link>
                  <Link 
                    href={`/my-donations/new?programId=${program.id}`}
                    className="flex-1 inline-flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                  >
                    <Heart className="h-4 w-4 mr-1.5" />
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