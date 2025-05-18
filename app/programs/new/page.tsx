"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Briefcase, Calendar, Users, DollarSign, ArrowLeft, Check, Info, Image } from "lucide-react"
import Link from "next/link"
import { createProgram } from "@/services/program-service"
import { ProgramInput } from "@/types"
import ImageUploader from "@/components/ImageUploader"

export default function NewProgramPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    shortDescription: "",
    category: "",
    location: "",
    manager: "",
    startDate: "",
    endDate: "",
    target: "",
    status: "draft",
    volunteerNeeded: false,
    volunteers: "",
    isFeatured: false,
    imageUrl: "",
    tags: ""
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormValues(prev => ({
      ...prev,
      [name]: checked
    }))
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formValues.title.trim()) {
      newErrors.title = "Program title is required"
    }
    
    if (!formValues.description.trim()) {
      newErrors.description = "Description is required"
    }
    
    if (!formValues.shortDescription.trim()) {
      newErrors.shortDescription = "Short description is required"
    }
    
    if (!formValues.category.trim()) {
      newErrors.category = "Category is required"
    }
    
    if (!formValues.location.trim()) {
      newErrors.location = "Location is required"
    }
    
    if (!formValues.manager.trim()) {
      newErrors.manager = "Program manager is required"
    }
    
    if (!formValues.startDate) {
      newErrors.startDate = "Start date is required"
    }
    
    if (!formValues.endDate) {
      newErrors.endDate = "End date is required"
    } else if (formValues.startDate && new Date(formValues.endDate) <= new Date(formValues.startDate)) {
      newErrors.endDate = "End date must be after start date"
    }
    
    if (!formValues.target) {
      newErrors.target = "Funding target is required"
    } else if (isNaN(Number(formValues.target)) || Number(formValues.target) <= 0) {
      newErrors.target = "Funding target must be a positive number"
    }
    
    if (formValues.volunteerNeeded && (!formValues.volunteers || isNaN(Number(formValues.volunteers)) || Number(formValues.volunteers) <= 0)) {
      newErrors.volunteers = "Number of volunteers must be a positive number"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = document.querySelector(`[name="${Object.keys(errors)[0]}"]`)
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Prepare program data for Firestore
      const programData: ProgramInput = {
        title: formValues.title,
        description: formValues.description,
        shortDescription: formValues.shortDescription,
        category: formValues.category,
        location: formValues.location,
        manager: formValues.manager,
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        target: Number(formValues.target),
        status: formValues.status as "active" | "draft" | "completed",
        volunteers: formValues.volunteerNeeded ? Number(formValues.volunteers) : 0,
        isFeatured: formValues.isFeatured,
        imageUrl: formValues.imageUrl,
        tags: formValues.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      }
      
      // Create program in Firestore
      const newProgram = await createProgram(programData)
      
      // Redirect to the new program's page
      router.push(`/programs/${newProgram.id}`)
    } catch (error) {
      console.error("Error creating program:", error)
      alert("Failed to create program. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/programs"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Program</h1>
            <p className="text-gray-500 mt-1">Add a new program or campaign for fundraising and volunteer management</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Program Details */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-cyan-600" />
              Program Details
            </h2>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
              <div className="col-span-1">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Program Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formValues.title}
                  onChange={handleChange}
                  className={`mt-2 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.title 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                  }`}
                  placeholder="e.g., Winter Relief Program"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
              
              <div className="col-span-1">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formValues.category}
                  onChange={handleChange}
                  className={`mt-2 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.category 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                  }`}
                >
                  <option value="">Select a category</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Emergency Aid">Emergency Aid</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Community">Community</option>
                  <option value="Environment">Environment</option>
                  <option value="Child Welfare">Child Welfare</option>
                  <option value="Elderly Care">Elderly Care</option>
                  <option value="Food Security">Food Security</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
              
              <div className="col-span-full">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formValues.description}
                  onChange={handleChange}
                  className={`mt-2 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.description 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                  }`}
                  placeholder="Describe the program, its goals, and its impact"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
              
              <div className="col-span-1">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={formValues.location}
                  onChange={handleChange}
                  className={`mt-2 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.location 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                  }`}
                  placeholder="e.g., Northeast Region"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>
              
              <div className="col-span-1">
                <label htmlFor="manager" className="block text-sm font-medium text-gray-700">
                  Program Manager <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="manager"
                  id="manager"
                  value={formValues.manager}
                  onChange={handleChange}
                  className={`mt-2 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.manager 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                  }`}
                  placeholder="e.g., John Smith"
                />
                {errors.manager && (
                  <p className="mt-1 text-sm text-red-600">{errors.manager}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Program Timeline */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-cyan-600" />
              Program Timeline
            </h2>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-3">
              <div className="col-span-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={formValues.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]} // Can't set date in the past
                  className={`mt-2 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.startDate 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>
              
              <div className="col-span-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={formValues.endDate}
                  onChange={handleChange}
                  min={formValues.startDate || new Date().toISOString().split('T')[0]} // Can't be before start date
                  className={`mt-2 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.endDate 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
              
              <div className="col-span-1">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formValues.status}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Funding Details */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-cyan-600" />
              Funding Details
            </h2>
          </div>
          
          <div className="px-6 py-6">
            <div className="max-w-md">
              <label htmlFor="target" className="block text-sm font-medium text-gray-700">
                Funding Target ($) <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="target"
                  id="target"
                  value={formValues.target}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  className={`block w-full pl-7 pr-12 rounded-md sm:text-sm ${
                    errors.target 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                  }`}
                  placeholder="0"
                  aria-describedby="target-description"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500" id="target-description">
                The total amount needed for this program
              </p>
              {errors.target && (
                <p className="mt-1 text-sm text-red-600">{errors.target}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Volunteer Management */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-cyan-600" />
              Volunteer Management
            </h2>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="volunteerNeeded"
                  name="volunteerNeeded"
                  type="checkbox"
                  checked={formValues.volunteerNeeded}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="volunteerNeeded" className="font-medium text-gray-700">
                  Volunteers needed for this program
                </label>
                <p className="text-gray-500">Enable volunteer management for this program</p>
              </div>
            </div>
            
            {formValues.volunteerNeeded && (
              <div className="pl-8 max-w-md">
                <label htmlFor="volunteers" className="block text-sm font-medium text-gray-700">
                  Number of Volunteers Needed <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="volunteers"
                  id="volunteers"
                  value={formValues.volunteers}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  className={`mt-2 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.volunteers 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                  }`}
                  placeholder="e.g., 5"
                />
                {errors.volunteers && (
                  <p className="mt-1 text-sm text-red-600">{errors.volunteers}</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Program Presentation */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Image className="h-5 w-5 mr-2 text-cyan-600" />
              Program Presentation
            </h2>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            <div className="col-span-full">
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
                Short Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="shortDescription"
                name="shortDescription"
                rows={2}
                value={formValues.shortDescription}
                onChange={handleChange}
                className={`mt-2 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.shortDescription 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                }`}
                placeholder="Brief description (shown in program listings)"
              />
              {errors.shortDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Program Image
              </label>
              <div className="mt-2">
                <ImageUploader 
                  currentImageUrl={formValues.imageUrl}
                  onImageUploaded={(imageUrl: string) => {
                    setFormValues(prev => ({ ...prev, imageUrl }))
                  }}
                  onImageRemoved={() => {
                    setFormValues(prev => ({ ...prev, imageUrl: "" }))
                  }}
                />
              </div>
              {formValues.imageUrl && (
                <p className="mt-1 text-xs text-gray-500">Image successfully uploaded</p>
              )}
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                id="tags"
                value={formValues.tags}
                onChange={handleChange}
                className="mt-2 block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                placeholder="education, children, health (comma separated)"
              />
              <p className="mt-1 text-xs text-gray-500">Enter tags separated by commas</p>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="isFeatured"
                  name="isFeatured"
                  type="checkbox"
                  checked={formValues.isFeatured}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isFeatured" className="font-medium text-gray-700">
                  Feature this program
                </label>
                <p className="text-gray-500">Featured programs appear on the homepage and at the top of listing pages</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Note</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  All programs start with $0 raised. You can update the fundraising progress from the program details page after creation.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <Link
            href="/programs"
            className="w-full sm:w-auto flex justify-center py-3 px-5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center py-3 px-5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Create Program
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 