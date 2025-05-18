"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { CheckCircle2, ArrowRight } from "lucide-react"

export default function OnboardingPage() {
  const { user, completeOnboarding } = useAuth()
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Onboarding data
  const [interests, setInterests] = useState<string[]>([])
  const [preferredCommunication, setPreferredCommunication] = useState("email")
  const [howHeard, setHowHeard] = useState("")
  const [donationFrequency, setDonationFrequency] = useState("occasional")

  const handleInterestToggle = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest))
    } else {
      setInterests([...interests, interest])
    }
  }

  const handleNextStep = () => {
    if (currentStep === 1 && interests.length === 0) {
      setError("Please select at least one interest")
      return
    }
    
    setError("")
    setCurrentStep(currentStep + 1)
  }

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      await completeOnboarding({
        interests,
        preferredCommunication,
        howHeard,
        donationFrequency,
      })
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Failed to save your preferences. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-r from-cyan-500 to-teal-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to CharityTrack
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's customize your experience, {user?.name}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium text-cyan-700">Step {currentStep} of 3</span>
              <span className="text-xs font-medium text-gray-500">{Math.round((currentStep / 3) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">What causes are you interested in?</h3>
                <p className="text-sm text-gray-500">Select all that apply. We'll personalize your dashboard based on your interests.</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {["Education", "Healthcare", "Environment", "Poverty", "Human Rights", "Animals", "Disaster Relief", "Arts & Culture"].map(interest => (
                    <div 
                      key={interest} 
                      className={`flex items-center justify-between px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                        interests.includes(interest) 
                          ? "border-cyan-500 bg-cyan-50 text-cyan-700" 
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => handleInterestToggle(interest)}
                    >
                      <span className="text-sm font-medium">{interest}</span>
                      {interests.includes(interest) && (
                        <CheckCircle2 className="h-5 w-5 text-cyan-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Communication preferences</h3>
                <p className="text-sm text-gray-500">Let us know how you'd like to hear from us.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred contact method
                    </label>
                    <select
                      value={preferredCommunication}
                      onChange={(e) => setPreferredCommunication(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="sms">SMS</option>
                      <option value="none">No communications</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      How often do you plan to donate?
                    </label>
                    <select
                      value={donationFrequency}
                      onChange={(e) => setDonationFrequency(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="occasional">Occasionally</option>
                      <option value="once">Just once</option>
                      <option value="undecided">Undecided</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Almost done!</h3>
                <p className="text-sm text-gray-500">Just one last question to help us improve.</p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    How did you hear about us?
                  </label>
                  <input
                    type="text"
                    value={howHeard}
                    onChange={(e) => setHowHeard(e.target.value)}
                    className="shadow-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Social media, friend, search, etc."
                  />
                </div>
                
                <div className="pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Review your choices:</h4>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Interests:</span> {interests.join(", ")}
                    </div>
                    <div>
                      <span className="font-medium">Communication method:</span> {preferredCommunication}
                    </div>
                    <div>
                      <span className="font-medium">Donation frequency:</span> {donationFrequency}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between pt-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 