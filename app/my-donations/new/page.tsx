"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Heart, CreditCard, Check } from "lucide-react"
import { createDonation } from "@/services/donation-service"
import { getAllPrograms } from "@/services/program-service"
import { Program } from "@/types"

export default function MakeDonation() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const preselectedProgramId = searchParams.get("programId")
  
  const [amount, setAmount] = useState("")
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(preselectedProgramId)
  const [paymentMethod, setPaymentMethod] = useState("Easypaisa")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDonationComplete, setIsDonationComplete] = useState(false)
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setIsLoadingPrograms(true)
        const activePrograms = await getAllPrograms()
        // Filter for only active programs
        const filteredPrograms = activePrograms.filter(p => p.status === "active")
        setPrograms(filteredPrograms)
        
        // If there's a preselected program ID from URL, use it
        if (preselectedProgramId) {
          setSelectedProgramId(preselectedProgramId)
        } else if (filteredPrograms.length > 0 && !selectedProgramId) {
          // Otherwise set the first program as default
          setSelectedProgramId(filteredPrograms[0].id)
        }
      } catch (err) {
        console.error("Error loading programs:", err)
        setError("Failed to load available programs. Please try again.")
      } finally {
        setIsLoadingPrograms(false)
      }
    }
    
    loadPrograms()
  }, [preselectedProgramId, selectedProgramId])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError("You must be logged in to make a donation")
      return
    }
    
    if (!selectedProgramId) {
      setError("Please select a program to donate to")
      return
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid donation amount")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Create donation in Firestore using the donation service
      await createDonation({
        programId: selectedProgramId,
        donorId: user.id,
        donorName: user.name,
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        status: "completed",
        paymentMethod: paymentMethod,
        isAnonymous: isAnonymous,
        note: note
      })
      
      // Show success state
      setIsDonationComplete(true)
      
      // Redirect to donation history after a short delay
      setTimeout(() => {
        router.push("/my-donations/history")
      }, 3000)
    } catch (err) {
      console.error("Error making donation:", err)
      setError("There was a problem processing your donation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Predefined donation amounts
  const donationAmounts = ["1000", "2000", "5000", "10000", "25000", "50000"]
  
  if (isDonationComplete) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You for Your Donation!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your generosity helps make a difference in the world.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            A receipt has been sent to your email address.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push("/my-donations")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-cyan-700 bg-cyan-100 hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => router.push("/my-donations/history")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              View Donation History
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <Heart className="mx-auto h-12 w-12 text-cyan-600" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Make a Donation</h1>
        <p className="mt-2 text-gray-600">Your support can change lives and communities.</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-800">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {/* Program Selection */}
        <div className="mb-6">
          <label htmlFor="programId" className="block text-sm font-medium text-gray-700 mb-2">
            Select Program
          </label>
          <select
            id="programId"
            value={selectedProgramId || ""}
            onChange={(e) => setSelectedProgramId(e.target.value || null)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            disabled={isLoadingPrograms}
          >
            {isLoadingPrograms ? (
              <option disabled>Loading programs...</option>
            ) : programs.length === 0 ? (
              <option disabled>No active programs available</option>
            ) : (
              programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.title}
                </option>
              ))
            )}
          </select>
        </div>
        
        {/* Donation Amount */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Donation Amount
          </label>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {donationAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt)}
                className={`rounded-md border py-2 px-3 text-sm font-medium ${
                  amount === amt
                    ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Rs. {amt}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center">
            <span className="text-gray-500 text-lg mr-2">Rs.</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
              required
              placeholder="Other amount"
              className="flex-1 rounded-md border-gray-300 px-3 py-2 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>
        
        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("Easypaisa")}
              className={`flex items-center rounded-md border p-3 ${
                paymentMethod === "Easypaisa"
                  ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              <span className="text-sm font-medium">Easypaisa</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("Jazz Cash")}
              className={`flex items-center rounded-md border p-3 ${
                paymentMethod === "Jazz Cash"
                  ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg
                className="mr-2 h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h18v8z" />
                <path d="M12 9.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              <span className="text-sm font-medium">Jazz Cash</span>
            </button>
          </div>
        </div>
        
        {/* Optional Note */}
        <div className="mb-6">
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
            Add a Note (Optional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder="Add a personal note to accompany your donation"
          ></textarea>
        </div>
        
        {/* Donor Information */}
        <div className="mb-6">
          <div className="flex items-center">
            <input
              id="anonymous"
              type="checkbox"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
              className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
            />
            <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
              Make this donation anonymous
            </label>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || isLoadingPrograms}
          className="w-full py-3 px-4 rounded-md bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Complete Donation"
          )}
        </button>
      </form>
    </div>
  )
} 