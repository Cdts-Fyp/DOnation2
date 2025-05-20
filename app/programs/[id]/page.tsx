"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Briefcase, ArrowLeft, MapPin, Calendar, Users, DollarSign, 
  Edit, Trash2, Download, Share2, ChevronRight, Check, User, Clock
} from "lucide-react"
import { getProgramById, deleteProgram } from "@/services/program-service"
import { getDonationsByProgram } from "@/services/donation-service"
import { getVolunteersByProgram } from "@/services/volunteer-service"
import { Program, Donation, Volunteer } from "@/types"

export default function ProgramDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [program, setProgram] = useState<Program | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [isDeleting, setIsDeleting] = useState(false)
  
  useEffect(() => {
    const fetchProgramData = async () => {
      setIsLoading(true)
      try {
        // Fetch program data from Firestore
        const fetchedProgram = await getProgramById(params.id)
        
        if (!fetchedProgram) {
          setIsLoading(false)
          return
        }
        
        setProgram(fetchedProgram)
        
        // Fetch related data
        const [fetchedDonations, fetchedVolunteers] = await Promise.all([
          getDonationsByProgram(params.id),
          getVolunteersByProgram(params.id)
        ])
        
        setDonations(fetchedDonations)
        setVolunteers(fetchedVolunteers)
      } catch (error) {
        console.error("Error fetching program data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProgramData()
  }, [params.id])
  
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this program? This action cannot be undone.")) {
      return
    }
    
    setIsDeleting(true)
    try {
      // Delete the program using our service
      await deleteProgram(params.id)
      
      // Redirect to programs list
      router.push("/programs")
    } catch (error) {
      console.error("Error deleting program:", error)
      alert("Failed to delete program. Please try again.")
      setIsDeleting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }
  
  if (!program) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Program not found</h3>
        <p className="mt-1 text-gray-500">The program you're looking for doesn't exist or has been deleted.</p>
        <div className="mt-6">
          <Link
            href="/programs"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Programs
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center gap-4">
          <Link
            href="/programs"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{program.title}</h1>
              <span
                className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  program.status === "active"
                    ? "bg-green-100 text-green-800"
                    : program.status === "draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
              </span>
            </div>
            <p className="text-gray-500 flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
              {program.location}
            </p>
          </div>
        </div>
        
        {/* <div className="flex items-center space-x-2">
          <Link
            href={`/programs/${program.id}/edit`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {isDeleting ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 mr-1 border-2 border-red-500 rounded-full border-t-transparent"></div>
                Deleting...
              </div>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </>
            )}
          </button>
        </div> */}
      </div>
      
      {/* Program Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-cyan-50 rounded-md">
              <Calendar className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Timeline</h2>
              <p className="text-sm font-bold text-gray-900">
                {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {Math.ceil((new Date(program.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-emerald-50 rounded-md">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Fundraising</h2>
              <p className="text-sm font-bold text-gray-900">${program.raised.toLocaleString()} raised</p>
              <p className="text-xs text-gray-500">of ${program.target.toLocaleString()} target</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-indigo-50 rounded-md">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Volunteers</h2>
              <p className="text-sm font-bold text-gray-900">{program.volunteers} volunteers</p>
              <p className="text-xs text-gray-500">
                <Link href={`/programs/${program.id}/volunteers`} className="text-indigo-600 hover:text-indigo-900">
                  Manage volunteers
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-purple-50 rounded-md">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Program Manager</h2>
              <p className="text-sm font-bold text-gray-900">{program.manager}</p>
              <p className="text-xs text-gray-500">
                <Link href="/users" className="text-purple-600 hover:text-purple-900">
                  View profile
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`whitespace-nowrap py-4 px-4 text-sm font-medium ${
                activeTab === "overview"
                  ? "border-b-2 border-cyan-500 text-cyan-600"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("donations")}
              className={`whitespace-nowrap py-4 px-4 text-sm font-medium ${
                activeTab === "donations"
                  ? "border-b-2 border-cyan-500 text-cyan-600"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Donations
            </button>
            <button
              onClick={() => setActiveTab("volunteers")}
              className={`whitespace-nowrap py-4 px-4 text-sm font-medium ${
                activeTab === "volunteers"
                  ? "border-b-2 border-cyan-500 text-cyan-600"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Volunteers
            </button>
            <button
              onClick={() => setActiveTab("updates")}
              className={`whitespace-nowrap py-4 px-4 text-sm font-medium ${
                activeTab === "updates"
                  ? "border-b-2 border-cyan-500 text-cyan-600"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Updates
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Program Description</h3>
                <p className="mt-2 text-gray-600">{program.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Fundraising Progress</h3>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">${program.raised.toLocaleString()} of ${program.target.toLocaleString()}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round((program.raised / program.target) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2.5 rounded-full"
                      style={{ width: `${Math.min(100, (program.raised / program.target) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Program Details</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Category</h4>
                    <p className="mt-1 text-sm text-gray-900">{program.category}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                    <p className="mt-1 text-sm text-gray-900">{program.location}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
                    <p className="mt-1 text-sm text-gray-900">{new Date(program.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">End Date</h4>
                    <p className="mt-1 text-sm text-gray-900">{new Date(program.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Program Manager</h4>
                    <p className="mt-1 text-sm text-gray-900">{program.manager}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{program.status}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* <Link
                    href={`/programs/${program.id}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-2 text-gray-500" />
                    Edit Program
                  </Link> */}
                  <Link
                    href="/donations/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Record Donation
                  </Link>
                  {/* <button
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2 text-gray-500" />
                    Download Report
                  </button> */}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "donations" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Recent Donations</h3>
                <Link
                  href="/donations/new"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Record Donation
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Donor
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No donations yet
                        </td>
                      </tr>
                    ) : donations.slice(0, 5).map((donation) => (
                      <tr key={donation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {donation.isAnonymous ? "Anonymous" : donation.donorName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${donation.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(donation.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            {donation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-cyan-600 hover:text-cyan-900">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {donations.length > 5 && (
                <div className="flex justify-center">
                  <Link
                    href={`/donations?program=${program.id}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View All Donations
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {activeTab === "volunteers" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Program Volunteers</h3>
                <Link
                  href={`/programs/${program.id}/volunteers/add`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Add Volunteers
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Volunteer
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Joined
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {volunteers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No volunteers yet
                        </td>
                      </tr>
                    ) : volunteers.slice(0, 5).map((volunteer) => (
                      <tr key={volunteer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-500">
                                {volunteer.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
                              <div className="text-sm text-gray-500">{volunteer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {volunteer.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(volunteer.joinedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              volunteer.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {volunteer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-cyan-600 hover:text-cyan-900">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {volunteers.length > 5 && (
                <div className="flex justify-center">
                  <Link
                    href={`/programs/${program.id}/volunteers`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Manage All Volunteers
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {activeTab === "updates" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Program Updates</h3>
                <button
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700"
                >
                  Post Update
                </button>
              </div>
              
              <div className="flex flex-col items-center justify-center h-40 p-6 text-center">
                <Clock className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No updates yet</h3>
                <p className="mt-1 text-gray-500">
                  Post updates about this program to keep donors and volunteers informed
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 