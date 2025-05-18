"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { Heart, Calendar, DollarSign, Award } from "lucide-react"
import Link from "next/link"

export default function DonorDashboard() {
  const { user } = useAuth()
  const { userDonations, campaigns, isLoadingDonations, isLoadingCampaigns, fetchDonations, fetchCampaigns } = useData()
  
  useEffect(() => {
    fetchDonations()
    fetchCampaigns()
  }, [fetchDonations, fetchCampaigns])
  
  // Calculate donor stats
  const totalDonated = userDonations.reduce((sum, donation) => sum + donation.amount, 0)
  const donationCount = userDonations.length
  const activeCampaigns = campaigns.filter(campaign => campaign.status === "active").length
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Donations Dashboard</h1>
        <p className="text-gray-500">Track your donation activity and impact</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-cyan-50 rounded-md">
              <DollarSign className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Donated</h2>
              <p className="text-2xl font-bold text-gray-900">Rs. {totalDonated}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-indigo-50 rounded-md">
              <Heart className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Donations Made</h2>
              <p className="text-2xl font-bold text-gray-900">{donationCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-amber-50 rounded-md">
              <Award className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Active Campaigns</h2>
              <p className="text-2xl font-bold text-gray-900">{activeCampaigns}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-emerald-50 rounded-md">
              <Calendar className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Last Donation</h2>
              <p className="text-2xl font-bold text-gray-900">
                {userDonations.length > 0 
                  ? new Date(userDonations[0].date).toLocaleDateString() 
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Donations */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Donations</h2>
            <Link 
              href="/my-donations/history" 
              className="text-sm font-medium text-cyan-600 hover:text-cyan-500"
            >
              View all
            </Link>
          </div>
          
          {isLoadingDonations ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            </div>
          ) : userDonations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Heart className="h-12 w-12 mx-auto text-gray-300" />
              <p className="mt-2">You haven&apos;t made any donations yet</p>
              <Link
                href="/my-donations/new"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                Make your first donation
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {userDonations.slice(0, 5).map((donation) => (
                <div key={donation.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {donation.campaign || "General Donation"}
                    </p>
                    <p className="text-sm text-gray-500">{new Date(donation.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Rs. {donation.amount}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Featured Campaigns */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Featured Campaigns</h2>
            <Link 
              href="/campaigns" 
              className="text-sm font-medium text-cyan-600 hover:text-cyan-500"
            >
              View all
            </Link>
          </div>
          
          {isLoadingCampaigns ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No active campaigns at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.slice(0, 3).map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium text-gray-900">{campaign.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{campaign.description}</p>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (campaign.raised / campaign.target) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Rs. {campaign.raised} raised</span>
                      <span>Rs. {campaign.target} goal</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/my-donations/new?campaign=${campaign.id}`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                      Donate Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 