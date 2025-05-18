"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"

// Define data types
export interface Donation {
  id: string
  userId: string
  amount: number
  currency: string
  date: string
  campaign?: string
  status: "pending" | "completed" | "failed"
  anonymous: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  joinedDate: string
  lastActive: string
  status: "active" | "inactive" | "blocked"
}

export interface Campaign {
  id: string
  title: string
  description: string
  target: number
  raised: number
  startDate: string
  endDate: string
  status: "active" | "completed" | "draft"
}

// Define context type
interface DataContextType {
  // Donations
  donations: Donation[]
  userDonations: Donation[]
  isLoadingDonations: boolean
  fetchDonations: () => Promise<void>
  addDonation: (donation: Omit<Donation, "id">) => Promise<void>
  
  // Users
  users: User[]
  isLoadingUsers: boolean
  fetchUsers: () => Promise<void>
  
  // Campaigns
  campaigns: Campaign[]
  isLoadingCampaigns: boolean
  fetchCampaigns: () => Promise<void>
}

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined)

// Mock data for demonstration
const mockDonations: Donation[] = [
  {
    id: "donation-1",
    userId: "user-1",
    amount: 100,
    currency: "USD",
    date: "2023-10-15",
    campaign: "Winter Relief",
    status: "completed",
    anonymous: false
  },
  {
    id: "donation-2",
    userId: "user-2",
    amount: 50,
    currency: "USD",
    date: "2023-10-16",
    campaign: "Education Fund",
    status: "completed",
    anonymous: true
  },
  {
    id: "donation-3",
    userId: "user-1",
    amount: 200,
    currency: "USD",
    date: "2023-10-20",
    campaign: "Healthcare Initiative",
    status: "completed",
    anonymous: false
  }
]

const mockUsers: User[] = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    joinedDate: "2023-01-15",
    lastActive: "2023-10-25",
    status: "active"
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "donor",
    joinedDate: "2023-02-20",
    lastActive: "2023-10-24",
    status: "active"
  }
]

const mockCampaigns: Campaign[] = [
  {
    id: "campaign-1",
    title: "Winter Relief",
    description: "Help families stay warm this winter",
    target: 10000,
    raised: 4500,
    startDate: "2023-09-01",
    endDate: "2023-12-31",
    status: "active"
  },
  {
    id: "campaign-2",
    title: "Education Fund",
    description: "Support children's education",
    target: 20000,
    raised: 15000,
    startDate: "2023-08-01",
    endDate: "2023-11-30",
    status: "active"
  }
]

// Provider component
export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  
  const [donations, setDonations] = useState<Donation[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  
  const [isLoadingDonations, setIsLoadingDonations] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false)
  
  // Fetch donations from API
  const fetchDonations = async () => {
    setIsLoadingDonations(true)
    try {
      // This would be an API call in a real app
      // For now, using mock data
      setDonations(mockDonations)
    } catch (error) {
      console.error("Error fetching donations:", error)
    } finally {
      setIsLoadingDonations(false)
    }
  }
  
  // Add a new donation
  const addDonation = async (donation: Omit<Donation, "id">) => {
    setIsLoadingDonations(true)
    try {
      // This would be an API call in a real app
      const newDonation: Donation = {
        ...donation,
        id: `donation-${Date.now()}`
      }
      
      setDonations(prev => [...prev, newDonation])
    } catch (error) {
      console.error("Error adding donation:", error)
      throw error
    } finally {
      setIsLoadingDonations(false)
    }
  }
  
  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoadingUsers(true)
    try {
      // This would be an API call in a real app
      setUsers(mockUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoadingUsers(false)
    }
  }
  
  // Fetch campaigns from API
  const fetchCampaigns = async () => {
    setIsLoadingCampaigns(true)
    try {
      // This would be an API call in a real app
      setCampaigns(mockCampaigns)
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    } finally {
      setIsLoadingCampaigns(false)
    }
  }
  
  // Get donations for current user
  const userDonations = user 
    ? donations.filter(donation => donation.userId === user.id)
    : []
  
  // Initialize data
  useEffect(() => {
    fetchDonations()
    fetchUsers()
    fetchCampaigns()
  }, [])
  
  return (
    <DataContext.Provider
      value={{
        donations,
        userDonations,
        isLoadingDonations,
        fetchDonations,
        addDonation,
        
        users,
        isLoadingUsers,
        fetchUsers,
        
        campaigns,
        isLoadingCampaigns,
        fetchCampaigns
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

// Custom hook to use the data context
export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
} 