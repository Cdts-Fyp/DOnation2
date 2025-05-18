"use client"

import { useState } from "react"
import { 
  addDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  serverTimestamp,
  updateDoc,
  doc
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ProgramInput } from "@/types"

// Mock data for programs
const mockPrograms: (ProgramInput & { isFeatured?: boolean, shortDescription?: string, tags?: string[] })[] = [
  {
    title: "Winter Relief",
    description: "Help families stay warm this winter with essential supplies and shelter support. Our Winter Relief program provides heating assistance, winter clothing, and emergency shelter to families in need during the coldest months of the year. We partner with local shelters and community centers to distribute supplies and ensure everyone has a warm place to stay.",
    shortDescription: "Help families stay warm this winter with essential supplies and shelter support.",
    target: 10000,
    startDate: "2023-11-01",
    endDate: "2023-12-31",
    status: "active",
    category: "Emergency Aid",
    location: "Northeast Region",
    volunteers: 0,
    manager: "Sarah Johnson",
    isFeatured: true,
    tags: ["winter", "emergency", "families"]
  },
  {
    title: "Education Fund",
    description: "Support underprivileged children's education through scholarships and learning materials. The Education Fund provides financial assistance to students from low-income backgrounds, covering tuition fees, books, and other educational resources. We also offer mentoring and tutoring programs to help students succeed academically.",
    shortDescription: "Support underprivileged children's education through scholarships and learning materials.",
    target: 20000,
    startDate: "2023-08-01",
    endDate: "2023-11-30",
    status: "active",
    category: "Education",
    location: "Multiple Cities",
    volunteers: 0,
    manager: "Michael Chen",
    isFeatured: true,
    tags: ["education", "children", "scholarships"]
  },
  {
    title: "Healthcare Initiative",
    description: "Providing medical services and health education to underserved communities. Our Healthcare Initiative aims to improve access to quality healthcare for marginalized populations. We organize free medical camps, health screenings, and awareness programs in underserved areas, focusing on preventive healthcare and early detection of diseases.",
    shortDescription: "Providing medical services and health education to underserved communities.",
    target: 30000,
    startDate: "2023-09-15",
    endDate: "2024-03-15",
    status: "active",
    category: "Healthcare",
    location: "Rural Areas",
    volunteers: 0,
    manager: "Dr. Lisa Wong",
    isFeatured: false,
    tags: ["healthcare", "medical", "community"]
  },
  {
    title: "Clean Water Project",
    description: "Building wells and water filtration systems in areas with limited access to clean water. The Clean Water Project works to provide safe, clean drinking water to communities facing water scarcity or contamination issues. We implement sustainable water solutions, including well-drilling, rainwater harvesting systems, and water purification technologies.",
    shortDescription: "Building wells and water filtration systems in areas with limited access to clean water.",
    target: 15000,
    startDate: "2023-10-01",
    endDate: "2024-02-28",
    status: "active",
    category: "Infrastructure",
    location: "Southern Region",
    volunteers: 0,
    manager: "Robert Miller",
    isFeatured: true,
    tags: ["water", "infrastructure", "health"]
  },
  {
    title: "Youth Mentorship",
    description: "Connecting at-risk youth with mentors to provide guidance and support. Our Youth Mentorship program pairs vulnerable young people with trained adult mentors who provide guidance, friendship, and positive role modeling. This program focuses on building life skills, improving educational outcomes, and creating pathways to success for participants.",
    shortDescription: "Connecting at-risk youth with mentors to provide guidance and support.",
    target: 8000,
    startDate: "2023-09-01",
    endDate: "2024-06-30",
    status: "active",
    category: "Community",
    location: "Urban Centers",
    volunteers: 0,
    manager: "Jamal Wilson",
    isFeatured: false,
    tags: ["youth", "mentorship", "community"]
  },
  {
    title: "Summer Camp",
    description: "Annual summer camp for underprivileged children. Our Summer Camp offers a fun, safe environment where children from disadvantaged backgrounds can enjoy recreational activities, arts and crafts, sports, and educational programming during the summer months. The camp focuses on building confidence, social skills, and creating lasting memories.",
    shortDescription: "Annual summer camp for underprivileged children.",
    target: 12000,
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    status: "draft",
    category: "Education",
    location: "Mountain Resort",
    volunteers: 0,
    manager: "Emily Rodriguez",
    isFeatured: false,
    tags: ["summer", "children", "recreation"]
  }
]

// Mock data for donors
const mockDonors = [
  { name: "John Smith", email: "john@example.com", role: "donor" },
  { name: "Jane Doe", email: "jane@example.com", role: "donor" },
  { name: "Michael Johnson", email: "michael@example.com", role: "donor" },
  { name: "Sarah Williams", email: "sarah@example.com", role: "donor" },
  { name: "Robert Brown", email: "robert@example.com", role: "donor" }
]

// Mock data for volunteers
const mockVolunteers = [
  { name: "Alice Cooper", email: "alice@example.com", role: "volunteer", phone: "555-1234" },
  { name: "Bob Wilson", email: "bob@example.com", role: "volunteer", phone: "555-5678" },
  { name: "Charlie Davis", email: "charlie@example.com", role: "volunteer", phone: "555-9012" },
  { name: "Diana Evans", email: "diana@example.com", role: "volunteer", phone: "555-3456" },
  { name: "Edward Martin", email: "edward@example.com", role: "volunteer", phone: "555-7890" }
]

// Mock data for user donation history
const mockUserHistory: Array<{
  userId: string;
  programIds: string[];
  donations: number[];
  dates: string[];
}> = [
  { userId: "", programIds: [], donations: [100, 250, 500], dates: ["2023-08-15", "2023-09-20", "2023-10-25"] },
  { userId: "", programIds: [], donations: [75, 150, 200, 300], dates: ["2023-07-10", "2023-08-05", "2023-09-15", "2023-10-20"] },
  { userId: "", programIds: [], donations: [50, 100, 150], dates: ["2023-08-01", "2023-09-01", "2023-10-01"] }
]

export default function DevFeedDataPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    programIds?: string[];
    userIds?: string[];
  } | null>(null)
  const [dataType, setDataType] = useState<string>("programs")

  // Function to add mock programs to Firestore
  const addMockPrograms = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Check if programs already exist to avoid duplicates
      const programsCollection = collection(db, "programs")
      const existingProgramsQuery = query(programsCollection, where("title", "in", mockPrograms.map(p => p.title)))
      const existingProgramsSnapshot = await getDocs(existingProgramsQuery)
      
      if (!existingProgramsSnapshot.empty) {
        setResult({
          success: false,
          message: `Found ${existingProgramsSnapshot.docs.length} existing programs with the same titles. Please clear data first.`
        })
        setLoading(false)
        return
      }

      // Add programs
      const programIds: string[] = []
      
      for (const program of mockPrograms) {
        const { isFeatured, shortDescription, tags, ...programData } = program
        const docRef = await addDoc(programsCollection, {
          ...programData,
          raised: 0,
          isFeatured: isFeatured || false,
          shortDescription: shortDescription || "",
          tags: tags || [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        programIds.push(docRef.id)
      }

      setResult({
        success: true,
        message: `Successfully added ${programIds.length} programs to Firestore.`,
        programIds
      })
    } catch (error) {
      console.error("Error adding mock programs:", error)
      setResult({
        success: false,
        message: `Error adding programs: ${error instanceof Error ? error.message : String(error)}`
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to add mock donations to programs
  const addMockDonations = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Get program IDs
      const programsCollection = collection(db, "programs")
      const programsSnapshot = await getDocs(programsCollection)
      
      if (programsSnapshot.empty) {
        setResult({
          success: false,
          message: "No programs found. Please add programs first."
        })
        setLoading(false)
        return
      }

      const programIds = programsSnapshot.docs.map(doc => doc.id)
      const donationsCollection = collection(db, "donations")
      let donationsAdded = 0

      // Add donors if they don't exist
      const usersCollection = collection(db, "users")
      const donorIds: string[] = []

      for (const donor of mockDonors) {
        const existingUserQuery = query(usersCollection, where("email", "==", donor.email))
        const existingUserSnapshot = await getDocs(existingUserQuery)
        
        let donorId: string
        
        if (existingUserSnapshot.empty) {
          const userDocRef = await addDoc(usersCollection, {
            ...donor,
            createdAt: serverTimestamp()
          })
          donorId = userDocRef.id
        } else {
          donorId = existingUserSnapshot.docs[0].id
        }
        
        donorIds.push(donorId)
      }

      // Add 3-5 donations to each program
      for (const programId of programIds) {
        const numDonations = Math.floor(Math.random() * 3) + 3 // 3-5 donations
        
        for (let i = 0; i < numDonations; i++) {
          const donorIndex = Math.floor(Math.random() * donorIds.length)
          const amount = Math.floor(Math.random() * 900) + 100 // $100-$999
          
          await addDoc(donationsCollection, {
            programId,
            donorId: donorIds[donorIndex],
            donorName: mockDonors[donorIndex].name,
            amount,
            date: new Date().toISOString().split('T')[0],
            status: "completed",
            paymentMethod: ["Credit Card", "PayPal", "Bank Transfer"][Math.floor(Math.random() * 3)],
            isAnonymous: Math.random() > 0.8, // 20% chance of anonymous
            createdAt: serverTimestamp()
          })
          
          donationsAdded++
        }
        
        // Update program raised amount
        await updateProgramRaisedAmount(programId);
      }

      setResult({
        success: true,
        message: `Successfully added ${donationsAdded} donations across ${programIds.length} programs.`,
        userIds: donorIds
      })
    } catch (error) {
      console.error("Error adding mock donations:", error)
      setResult({
        success: false,
        message: `Error adding donations: ${error instanceof Error ? error.message : String(error)}`
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to update a program's raised amount
  const updateProgramRaisedAmount = async (programId: string) => {
    try {
      // Get all donations for this program
      const donationsCollection = collection(db, "donations")
      const donationsQuery = query(donationsCollection, where("programId", "==", programId))
      const donationsSnapshot = await getDocs(donationsQuery)
      
      // Calculate total raised
      let totalRaised = 0
      donationsSnapshot.docs.forEach(doc => {
        const donation = doc.data()
        if (donation.status === "completed") {
          totalRaised += donation.amount
        }
      })
      
      // Update program with new raised amount
      const programDoc = doc(db, "programs", programId)
      await updateDoc(programDoc, { 
        raised: totalRaised,
        updatedAt: serverTimestamp()
      })
      
    } catch (error) {
      console.error(`Error updating raised amount for program ${programId}:`, error)
      throw error
    }
  }

  // Function to add mock volunteers to programs
  const addMockVolunteers = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Get program IDs
      const programsCollection = collection(db, "programs")
      const programsSnapshot = await getDocs(programsCollection)
      
      if (programsSnapshot.empty) {
        setResult({
          success: false,
          message: "No programs found. Please add programs first."
        })
        setLoading(false)
        return
      }

      const programIds = programsSnapshot.docs.map(doc => doc.id)
      const volunteersCollection = collection(db, "volunteers")
      let volunteersAdded = 0

      // Add volunteer users if they don't exist
      const usersCollection = collection(db, "users")
      const volunteerIds: string[] = []

      for (const volunteer of mockVolunteers) {
        const existingUserQuery = query(usersCollection, where("email", "==", volunteer.email))
        const existingUserSnapshot = await getDocs(existingUserQuery)
        
        let volunteerId: string
        
        if (existingUserSnapshot.empty) {
          const userDocRef = await addDoc(usersCollection, {
            name: volunteer.name,
            email: volunteer.email,
            role: "volunteer",
            createdAt: serverTimestamp()
          })
          volunteerId = userDocRef.id
        } else {
          volunteerId = existingUserSnapshot.docs[0].id
        }
        
        volunteerIds.push(volunteerId)
      }

      // Add 2-4 volunteers to each program
      for (const programId of programIds) {
        const numVolunteers = Math.floor(Math.random() * 3) + 2 // 2-4 volunteers
        const volunteerIndexes = new Set<number>()
        
        // Ensure we don't add the same volunteer twice to a program
        while (volunteerIndexes.size < numVolunteers && volunteerIndexes.size < mockVolunteers.length) {
          volunteerIndexes.add(Math.floor(Math.random() * mockVolunteers.length))
        }
        
        for (const index of volunteerIndexes) {
          const roles = ["Helper", "Coordinator", "Driver", "Counselor"]
          const role = roles[Math.floor(Math.random() * roles.length)]
          
          await addDoc(volunteersCollection, {
            programId,
            name: mockVolunteers[index].name,
            email: mockVolunteers[index].email,
            phone: mockVolunteers[index].phone,
            role,
            joinedDate: new Date().toISOString().split('T')[0],
            status: "active"
          })
          
          volunteersAdded++
        }
        
        // Update program volunteer count
        await updateProgramVolunteerCount(programId);
      }

      setResult({
        success: true,
        message: `Successfully added ${volunteersAdded} volunteers across ${programIds.length} programs.`,
        userIds: volunteerIds
      })
    } catch (error) {
      console.error("Error adding mock volunteers:", error)
      setResult({
        success: false,
        message: `Error adding volunteers: ${error instanceof Error ? error.message : String(error)}`
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Function to update a program's volunteer count
  const updateProgramVolunteerCount = async (programId: string) => {
    try {
      // Get all volunteers for this program
      const volunteersCollection = collection(db, "volunteers")
      const volunteersQuery = query(volunteersCollection, where("programId", "==", programId))
      const volunteersSnapshot = await getDocs(volunteersQuery)
      
      // Update program with new volunteer count
      const programDoc = doc(db, "programs", programId)
      await updateDoc(programDoc, { 
        volunteers: volunteersSnapshot.docs.length,
        updatedAt: serverTimestamp()
      })
      
    } catch (error) {
      console.error(`Error updating volunteer count for program ${programId}:`, error)
      throw error
    }
  }

  // Function to create user donation history
  const createUserHistory = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Get donor users
      const usersCollection = collection(db, "users")
      const donorQuery = query(usersCollection, where("role", "==", "donor"))
      const donorSnapshot = await getDocs(donorQuery)
      
      if (donorSnapshot.empty) {
        setResult({
          success: false,
          message: "No donor users found. Please add donors first."
        })
        setLoading(false)
        return
      }

      // Get programs
      const programsCollection = collection(db, "programs")
      const programsSnapshot = await getDocs(programsCollection)
      
      if (programsSnapshot.empty) {
        setResult({
          success: false,
          message: "No programs found. Please add programs first."
        })
        setLoading(false)
        return
      }
      
      const programIds = programsSnapshot.docs.map(doc => doc.id)
      const donorIds = donorSnapshot.docs.map(doc => doc.id)
      const donationsCollection = collection(db, "donations")
      let historyRecordsAdded = 0;
      
      // For each user history template
      for (let i = 0; i < Math.min(mockUserHistory.length, donorIds.length); i++) {
        const userHistory = mockUserHistory[i];
        userHistory.userId = donorIds[i];
        
        // Assign program IDs randomly
        userHistory.programIds = [];
        const numPrograms = Math.min(userHistory.donations.length, programIds.length);
        
        // Pick random programs without repetition
        const selectedPrograms = new Set<string>();
        while (selectedPrograms.size < numPrograms) {
          selectedPrograms.add(programIds[Math.floor(Math.random() * programIds.length)]);
        }
        userHistory.programIds = Array.from(selectedPrograms);
        
        // Create donation records
        for (let j = 0; j < userHistory.donations.length; j++) {
          // Get donor info
          const donorDoc = donorSnapshot.docs.find(doc => doc.id === userHistory.userId);
          const donorData = donorDoc?.data();
          
          if (donorData) {
            await addDoc(donationsCollection, {
              programId: userHistory.programIds[j % userHistory.programIds.length],
              donorId: userHistory.userId,
              donorName: donorData.name,
              amount: userHistory.donations[j],
              date: userHistory.dates[j],
              status: "completed",
              paymentMethod: ["Credit Card", "PayPal", "Bank Transfer"][Math.floor(Math.random() * 3)],
              isAnonymous: Math.random() > 0.8, // 20% chance of anonymous
              createdAt: serverTimestamp()
            });
            historyRecordsAdded++;
          }
        }
      }
      
      // Update program raised amounts
      for (const programId of programIds) {
        await updateProgramRaisedAmount(programId);
      }

      setResult({
        success: true,
        message: `Successfully added ${historyRecordsAdded} historical donation records for ${Math.min(mockUserHistory.length, donorIds.length)} users.`
      });
      
    } catch (error) {
      console.error("Error adding user history:", error)
      setResult({
        success: false,
        message: `Error adding user history: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setLoading(false);
    }
  }
  
  // Function to update featured program status
  const updateFeaturedPrograms = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Get all programs
      const programsCollection = collection(db, "programs");
      const programsSnapshot = await getDocs(programsCollection);
      
      if (programsSnapshot.empty) {
        setResult({
          success: false,
          message: "No programs found to mark as featured."
        });
        setLoading(false);
        return;
      }
      
      // Match the program titles with our featured list
      const featuredPrograms = mockPrograms.filter(p => p.isFeatured).map(p => p.title);
      let featuredCount = 0;
      
      for (const programDoc of programsSnapshot.docs) {
        const program = programDoc.data();
        const isFeatured = featuredPrograms.includes(program.title);
        
        await updateDoc(programDoc.ref, {
          isFeatured: isFeatured,
          updatedAt: serverTimestamp()
        });
        
        if (isFeatured) {
          featuredCount++;
        }
      }
      
      setResult({
        success: true,
        message: `Successfully updated featured status for ${programsSnapshot.docs.length} programs. ${featuredCount} programs marked as featured.`
      });
      
    } catch (error) {
      console.error("Error updating featured programs:", error);
      setResult({
        success: false,
        message: `Error updating featured programs: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setLoading(false);
    }
  }

  // Function to clear all data
  const clearAllData = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Clear programs
      const programsCollection = collection(db, "programs")
      const programsSnapshot = await getDocs(programsCollection)
      let programsDeleted = 0
      
      for (const doc of programsSnapshot.docs) {
        await deleteDoc(doc.ref)
        programsDeleted++
      }

      // Clear donations
      const donationsCollection = collection(db, "donations")
      const donationsSnapshot = await getDocs(donationsCollection)
      let donationsDeleted = 0
      
      for (const doc of donationsSnapshot.docs) {
        await deleteDoc(doc.ref)
        donationsDeleted++
      }

      // Clear volunteers
      const volunteersCollection = collection(db, "volunteers")
      const volunteersSnapshot = await getDocs(volunteersCollection)
      let volunteersDeleted = 0
      
      for (const doc of volunteersSnapshot.docs) {
        await deleteDoc(doc.ref)
        volunteersDeleted++
      }

      setResult({
        success: true,
        message: `Successfully deleted ${programsDeleted} programs, ${donationsDeleted} donations, and ${volunteersDeleted} volunteers.`
      })
    } catch (error) {
      console.error("Error clearing data:", error)
      setResult({
        success: false,
        message: `Error clearing data: ${error instanceof Error ? error.message : String(error)}`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Development Data Feeder</h1>
      <p className="mb-6 text-gray-600">
        This page allows you to populate the database with mock data for testing purposes.
        <strong className="text-red-600 block mt-2">Warning: Use this in development only!</strong>
      </p>
      
      {/* Data Type selector */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Select Data Type</h2>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setDataType("programs")}
            className={`px-4 py-2 rounded-md ${dataType === "programs" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
          >
            Programs
          </button>
          <button 
            onClick={() => setDataType("donations")}
            className={`px-4 py-2 rounded-md ${dataType === "donations" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"}`}
          >
            Donations
          </button>
          <button 
            onClick={() => setDataType("volunteers")}
            className={`px-4 py-2 rounded-md ${dataType === "volunteers" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-800"}`}
          >
            Volunteers
          </button>
          <button 
            onClick={() => setDataType("featured")}
            className={`px-4 py-2 rounded-md ${dataType === "featured" ? "bg-amber-600 text-white" : "bg-gray-200 text-gray-800"}`}
          >
            Featured Programs
          </button>
          <button 
            onClick={() => setDataType("history")}
            className={`px-4 py-2 rounded-md ${dataType === "history" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"}`}
          >
            User History
          </button>
          <button 
            onClick={() => setDataType("clear")}
            className={`px-4 py-2 rounded-md ${dataType === "clear" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-800"}`}
          >
            Clear Data
          </button>
        </div>
      </div>

      {/* Data Type content */}
      {dataType === "programs" && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Programs</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add {mockPrograms.length} mock programs to the database. Programs will include basic info, short descriptions, featured status, and tags.
          </p>
          <div className="mb-4 bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-semibold mb-2">Featured Programs:</h3>
            <ul className="text-xs text-gray-600 list-disc list-inside">
              {mockPrograms.filter(p => p.isFeatured).map(p => (
                <li key={p.title}>{p.title}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={addMockPrograms}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Loading..." : "Add Mock Programs"}
          </button>
        </div>
      )}

      {dataType === "donations" && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Donations</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add mock donations (3-5 per program) to existing programs. This will also update each program's raised amount automatically.
          </p>
          <button
            onClick={addMockDonations}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
          >
            {loading ? "Loading..." : "Add Mock Donations"}
          </button>
        </div>
      )}

      {dataType === "volunteers" && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Volunteers</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add mock volunteers (2-4 per program) to existing programs. This will also update each program's volunteer count automatically.
          </p>
          <button
            onClick={addMockVolunteers}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-300"
          >
            {loading ? "Loading..." : "Add Mock Volunteers"}
          </button>
        </div>
      )}
      
      {dataType === "featured" && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Featured Programs</h2>
          <p className="text-sm text-gray-600 mb-4">
            Update which programs are featured based on the predefined featured program list. This makes them appear on the featured programs page.
          </p>
          <div className="mb-4 bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-semibold mb-2">Programs that will be featured:</h3>
            <ul className="text-xs text-gray-600 list-disc list-inside">
              {mockPrograms.filter(p => p.isFeatured).map(p => (
                <li key={p.title}>{p.title}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={updateFeaturedPrograms}
            disabled={loading}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:bg-amber-300"
          >
            {loading ? "Loading..." : "Update Featured Programs"}
          </button>
        </div>
      )}
      
      {dataType === "history" && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">User Donation History</h2>
          <p className="text-sm text-gray-600 mb-4">
            Create donation history for users with varying donation patterns and amounts. This creates a more realistic user profile for testing.
          </p>
          <div className="mb-4 bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-semibold mb-2">Sample History Patterns:</h3>
            {mockUserHistory.map((history, index) => (
              <div key={index} className="mb-2 text-xs text-gray-600">
                <p>User {index + 1}: {history.donations.length} donations, amounts: ${history.donations.join(', $')}</p>
              </div>
            ))}
          </div>
          <button
            onClick={createUserHistory}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {loading ? "Loading..." : "Create User History"}
          </button>
        </div>
      )}

      {dataType === "clear" && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Clear Data</h2>
          <p className="text-sm text-red-600 mb-4">
            Delete all programs, donations, and volunteers from the database. This action cannot be undone.
          </p>
          <button
            onClick={clearAllData}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300"
          >
            {loading ? "Loading..." : "Clear All Data"}
          </button>
        </div>
      )}

      {result && (
        <div className={`p-4 mb-8 rounded-lg ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="font-medium">{result.message}</p>
          {result.programIds && (
            <div className="mt-2">
              <p className="font-medium">Program IDs:</p>
              <ul className="list-disc list-inside mt-1">
                {result.programIds.map((id, index) => (
                  <li key={id} className="text-sm">
                    {mockPrograms[index].title}: <code className="bg-white px-1 py-0.5 rounded">{id}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.userIds && (
            <div className="mt-2">
              <p className="font-medium">User IDs:</p>
              <div className="mt-1 text-sm">
                <code className="bg-white px-1 py-0.5 rounded">{result.userIds.length} users created/updated</code>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Recommended Process</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Clear all data first if needed</li>
          <li>Add mock programs</li>
          <li>Update featured programs</li>
          <li>Add mock donations</li>
          <li>Add mock volunteers</li>
          <li>Create user history</li>
        </ol>
      </div>
    </div>
  )
} 