"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  DollarSign, User, MessageSquare, Calendar, CreditCard, Check, ArrowLeft
} from "lucide-react"
import { createDonation } from "@/services/donation-service"
import { getAllPrograms } from "@/services/program-service"
import { Program } from "@/types"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

// Define the DonationInput type
interface DonationInput {
  donorName: string;
  amount: number;
  date: string;
  programId: string;
  status: "completed" | "pending" | "failed";
  paymentMethod: string;
  isAnonymous: boolean;
  note: string;
}

export default function NewDonationPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState<DonationInput>({
    donorName: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    programId: "",
    status: "completed",
    paymentMethod: "easypaisa",
    isAnonymous: false,
    note: ""
  })
  
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string
  }>({})
  
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const programs = await getAllPrograms()
        setPrograms(programs)
        if (programs.length > 0) {
          setFormData(prev => ({ ...prev, programId: programs[0].id }))
        }
      } catch (error) {
        console.error("Error fetching programs:", error)
        setError("Failed to load programs. Please try again.")
  }
    }
    
    fetchPrograms()
  }, [])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    let newValue: string | number | boolean = value
    
    // Handle different input types
    if (type === "number") {
      newValue = value === "" ? 0 : parseFloat(value)
    } else if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    
    if (!formData.donorName && !formData.isAnonymous) {
      errors.donorName = "Donor name is required unless anonymous"
    }
    
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = "Amount must be greater than 0"
    }
    
    if (!formData.programId) {
      errors.programId = "Please select a program"
    }
    
    if (!formData.date) {
      errors.date = "Date is required"
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    if (!user) {
      setError("You must be logged in to make a donation")
      return
    }
    
    try {
      setLoading(true)
      setError("")
      
      // Create the donation - this will automatically update the program's raised amount
      const donation = await createDonation({
        ...formData,
        donorId: user.id,
        date: new Date(formData.date).toISOString()
      })
      
      // No need to manually update program amount here - removed redundant code
      // The donation service already handles updating the program's raised amount
      
      setSuccess(true)
      
      // Reset form after submission
      setFormData({
        donorName: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        programId: programs.length > 0 ? programs[0].id : "",
        status: "completed",
        paymentMethod: "easypaisa",
        isAnonymous: false,
        note: ""
      })
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/donations")
      }, 1500)
      
    } catch (error) {
      console.error("Error submitting donation:", error)
      setError("Failed to submit donation. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
        <Link
          href="/donations"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Record New Donation</h1>
            <p className="text-gray-500 mt-1">Add a new donation to a program</p>
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center text-green-800 mb-8">
          <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
          <p>Donation recorded successfully! Redirecting...</p>
                  </div>
                )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 mb-8">
          {error}
                  </div>
                )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Card: Donor Information */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-cyan-600" />
              Donor Information
            </h2>
            </div>

          <div className="px-6 py-6 space-y-6">
            <div className="flex items-center">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleChange}
                  className="h-5 w-5 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
              </div>
              <label htmlFor="isAnonymous" className="ml-3 block text-sm font-medium text-gray-700">
                Anonymous Donation
              </label>
          </div>

            {!formData.isAnonymous && (
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="donorName"
                    id="donorName"
                    placeholder="Full Name"
                    value={formData.donorName}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      validationErrors.donorName ? "border-red-300" : "border-gray-300"
                    } rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm`}
                  />
                </div>
                {validationErrors.donorName && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.donorName}</p>
                )}
              </div>
            )}
            </div>
          </div>

        {/* Card: Donation Details */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-cyan-600" />
              Donation Details
            </h2>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div>
              <label htmlFor="programId" className="block text-sm font-medium text-gray-700 mb-2">
                Program <span className="text-red-500">*</span>
              </label>
              <select
                id="programId"
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                className={`block w-full pl-3 pr-10 py-3 text-base border ${
                  validationErrors.programId ? "border-red-300" : "border-gray-300"
                } focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-lg`}
              >
                <option value="" disabled>Select a program</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.title}
                  </option>
                ))}
              </select>
              {validationErrors.programId && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.programId}</p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (PKR) <span className="text-red-500">*</span>
                  </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="h-5 w-5 text-gray-400 font-medium">Rs.</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount || ""}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      validationErrors.amount ? "border-red-300" : "border-gray-300"
                    } rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm`}
                  />
                </div>
                {validationErrors.amount && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.amount}</p>
                )}
              </div>
              
                <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                  </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      validationErrors.date ? "border-red-300" : "border-gray-300"
                    } rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm`}
                  />
                </div>
                {validationErrors.date && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.date}</p>
                )}
              </div>
          </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm"
                  >
                    <option value="easypaisa">Easypaisa</option>
                    <option value="jazz_cash">Jazz Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
              </div>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-lg"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
              </div>
            </div>
        
        {/* Card: Additional Information */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-cyan-600" />
              Additional Information
            </h2>
          </div>

          <div className="px-6 py-6">
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <div className="relative rounded-lg shadow-sm">
                <textarea
                  id="note"
                  name="note"
                  rows={4}
                  placeholder="Additional notes about this donation"
                  value={formData.note}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm"
                />
              </div>
              </div>
            </div>
          </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <Link
            href="/donations"
            className="w-full sm:w-auto flex justify-center py-3 px-5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
              Cancel
            </Link>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center py-3 px-5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Record Donation"
            )}
            </button>
          </div>
        </form>
      </div>
  )
}
