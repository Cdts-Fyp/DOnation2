"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import React from "react"
import { 
  Calendar, DollarSign, Heart, MapPin, User, Tag, Share2, Facebook, Twitter, Linkedin
} from "lucide-react"
import { getProgramById } from "@/services/program-service"
import { getDonationsByProgram, subscribeToRecentDonations } from "@/services/donation-service"
import { Program, Donation } from "@/types"
import Link from "next/link"

export default function ProgramDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [program, setProgram] = useState<Program | null>(null)
  const [recentDonations, setRecentDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showShareOptions, setShowShareOptions] = useState(false)
  
  // Extract id as a string to avoid params promise issues
  const programId = String(params?.id || "")

  useEffect(() => {
    const fetchProgramData = async () => {
      try {
        setIsLoading(true)
        
        if (!programId) {
          setError("Invalid program ID")
          return
        }
        
        // Get program details
        const fetchedProgram = await getProgramById(programId)
        
        if (!fetchedProgram) {
          setError("Program not found")
          return
        }
        
        setProgram(fetchedProgram)
        
        // Initial fetch of recent donations
        const donations = await getDonationsByProgram(programId)
        setRecentDonations(donations.slice(0, 5)) // Show only the 5 most recent donations
        
      } catch (error) {
        console.error("Error fetching program details:", error)
        setError("Failed to load program details")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProgramData()
  }, [programId])
  
  // Set up real-time listener for donations
  useEffect(() => {
    if (!programId) return
    
    // Subscribe to real-time donation updates
    const unsubscribe = subscribeToRecentDonations(
      programId,
      (donations) => {
        setRecentDonations(donations)
      }
    )
    
    // Cleanup function to unsubscribe when component unmounts
    return () => {
      unsubscribe()
    }
  }, [programId])
  
  const handleShare = (platform: string) => {
    if (!program) return
    
    const url = window.location.href
    const text = `Check out this program: ${program.title}`
    
    let shareUrl = ''
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(program.title)}&summary=${encodeURIComponent(program.shortDescription || program.description.substring(0, 100))}`
        break
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
        return
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }
  
  if (error || !program) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">{error || "Program not found"}</h2>
        <p className="mt-2 text-gray-600">
          The program you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/programs/public"
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
        >
          View All Programs
        </Link>
      </div>
    )
  }
  
  const percentFunded = Math.min(100, Math.round((program.raised / program.target) * 100))
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link 
        href="/programs/public"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        &larr; Back to Programs
      </Link>
      
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2">
          {/* Program Image */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="h-72 sm:h-96 overflow-hidden relative">
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
                <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Featured
                </div>
              )}
            </div>
            
            {/* Program Header */}
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Tag className="h-4 w-4 mr-1" />
                <span>{program.category}</span>
                <span className="mx-2">•</span>
                <MapPin className="h-4 w-4 mr-1" />
                <span>{program.location}</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {program.title}
              </h1>
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                </span>
                <span className="mx-2">•</span>
                <User className="h-4 w-4 mr-1" />
                <span>Managed by {program.manager}</span>
              </div>
              
              {/* Tags */}
              {program.tags && program.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {program.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </button>
                
                {showShareOptions && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => handleShare('facebook')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                        LinkedIn
                      </button>
                      <button
                        onClick={() => handleShare('copy')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Program Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About This Program</h2>
            <div className="prose max-w-none">
              <p className="text-gray-600 whitespace-pre-line">{program.description}</p>
            </div>
          </div>
        </div>
        
        {/* Sidebar Column */}
        <div className="lg:col-span-1 mt-8 lg:mt-0">
          {/* Donation Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Fundraising Progress</h2>
            
            <div className="mb-6">
              <div className="flex justify-between text-2xl font-bold mb-1">
                <span className="text-cyan-600">
                  Rs. {program.raised.toLocaleString()}
                </span>
                <span className="text-gray-600">
                  of Rs. {program.target.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-4 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${percentFunded}%` }}
                ></div>
              </div>
              <p className="text-center text-sm font-medium text-gray-500 mt-2">
                {percentFunded}% funded
              </p>
            </div>
            
            {/* Donate Button */}
            <Link 
              href={`/my-donations/new?programId=${program.id}`}
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <Heart className="h-5 w-5 mr-2" />
              Donate Now
            </Link>
          </div>
          
          {/* Recent Donors */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Donors</h2>
            
            {recentDonations.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Be the first to donate to this program!
              </p>
            ) : (
              <ul className="space-y-4">
                {recentDonations.map(donation => (
                  <li key={donation.id} className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {donation.donorAvatar ? (
                        <img 
                          src={donation.donorAvatar} 
                          alt={donation.isAnonymous ? "Anonymous" : donation.donorName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {donation.isAnonymous ? "Anonymous" : donation.donorName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Rs. {donation.amount.toLocaleString()} • {new Date(donation.date).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Program Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Program Details</h2>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-cyan-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Start Date</p>
                  <p className="text-sm text-gray-500">
                    {new Date(program.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-cyan-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">End Date</p>
                  <p className="text-sm text-gray-500">
                    {new Date(program.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-cyan-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-500">
                    {program.location}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-cyan-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Program Manager</p>
                  <p className="text-sm text-gray-500">
                    {program.manager}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 