"use client"

import { useState, useEffect, FormEvent } from "react"
import { 
  User, 
  Bell, 
  Shield, 
  LogOut, 
  Mail, 
  Phone, 
  Camera, 
  CheckCircle, 
  AlertTriangle,
  LayoutDashboard
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ImageUploader from "@/components/ImageUploader"

// Extend the User type to include the fields we need
interface ExtendedUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  phone?: string
}

export default function SettingsPage() {
  const { user, updateUserProfile, logout } = useAuth()
  const router = useRouter()
  
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: ""
  })
  
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  
  // Load user data into form
  useEffect(() => {
    if (user) {
      const extendedUser = user as unknown as ExtendedUser;
      
      setProfileForm({
        name: extendedUser.name || "",
        email: extendedUser.email || "",
        phone: extendedUser.phone || "",
        avatar: extendedUser.avatar || ""
      })
    }
  }, [user])
  
  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: "", text: "" })
    
    try {
      await updateUserProfile({
        name: profileForm.name,
        avatar: profileForm.avatar,
        // Cast to any to allow phone field
        phone: profileForm.phone
      } as any)
      
      setMessage({ 
        type: "success", 
        text: "Profile updated successfully" 
      })
    } catch (error) {
      console.error("Profile update error:", error)
      setMessage({ 
        type: "error", 
        text: "Failed to update profile. Please try again." 
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: "", text: "" })
    
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setMessage({ 
        type: "error", 
        text: "New passwords do not match" 
      })
      setIsLoading(false)
      return
    }
    
    if (securityForm.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters"
      })
      setIsLoading(false)
      return
    }
    
    try {
      // Import the updatePassword function
      const { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } = await import("firebase/auth")
      const auth = getAuth()
      const user = auth.currentUser
      
      if (!user || !user.email) {
        throw new Error("No authenticated user found")
      }
      
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        user.email, 
        securityForm.currentPassword
      )
      
      await reauthenticateWithCredential(user, credential)
      
      // Update password
      await updatePassword(user, securityForm.newPassword)
      
      setMessage({ 
        type: "success", 
        text: "Password updated successfully" 
      })
      
      // Reset form
      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    } catch (error: any) {
      console.error("Password update error:", error)
      if (error.code === "auth/wrong-password") {
        setMessage({
          type: "error",
          text: "Current password is incorrect"
        })
      } else if (error.code === "auth/weak-password") {
        setMessage({
          type: "error",
          text: "Please choose a stronger password"
        })
      } else if (error.code === "auth/requires-recent-login") {
        setMessage({
          type: "error",
          text: "For security reasons, please log out and log back in before changing your password"
        })
      } else {
        setMessage({
          type: "error",
          text: error.message || "Failed to update password. Please try again."
        })
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }
  
  // Determine the correct dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user) return "/";
    
    switch (user.role) {
      case "admin":
        return "/admin";
      case "donor":
        return "/my-donations";
      case "volunteer":
        return "/volunteer";
      default:
        return "/";
    }
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your settings...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage your account preferences and personal information
        </p>
      </div>
      
      {/* Success or Error Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === "success" 
            ? "bg-green-50 border border-green-200" 
            : "bg-red-50 border border-red-200"
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                message.type === "success" ? "text-green-800" : "text-red-800"
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 text-center border-b border-gray-200">
              <div className="w-24 h-24 rounded-full bg-cyan-100 mx-auto mb-4 relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-12 h-12 text-cyan-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                )}
                <button className="absolute bottom-0 right-0 bg-cyan-600 text-white p-1.5 rounded-full">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="mt-1 inline-block px-2 py-1 text-xs font-medium rounded-full bg-cyan-100 text-cyan-800 capitalize">
                {user.role}
              </p>
            </div>
            
            <div className="p-4">
              <ul className="space-y-1">
                <li>
                  <Link 
                    href={getDashboardUrl()}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(getDashboardUrl());
                    }}
                  >
                    <LayoutDashboard className="mr-3 h-5 w-5" />
                    Back to Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-md ${
                      activeTab === "profile"
                        ? "bg-cyan-50 text-cyan-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <User className="mr-3 h-5 w-5" />
                    Profile Information
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-md ${
                      activeTab === "security"
                        ? "bg-cyan-50 text-cyan-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Shield className="mr-3 h-5 w-5" />
                    Security
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
          
          {/* <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Contact our support team for assistance with your account.
            </p>
            <a
              href="/help"
              className="text-sm font-medium text-cyan-600 hover:text-cyan-500"
            >
              Visit Help Center →
            </a>
          </div> */}
        </div>
        
        {/* Main content */}
        <div className="col-span-12 md:col-span-9">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          <Mail className="h-4 w-4" />
                        </span>
                        <input
                          type="email"
                          id="email"
                          value={profileForm.email}
                          readOnly
                          className="block w-full rounded-none rounded-r-md border-gray-300 bg-gray-50 sm:text-sm"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                    
                    <div>
                    
                    </div>
                    
                    <div>
                      <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Picture
                      </label>
                      <ImageUploader 
                        currentImageUrl={profileForm.avatar}
                        onImageUploaded={(imageUrl) => setProfileForm({...profileForm, avatar: imageUrl})}
                        onImageRemoved={() => setProfileForm({...profileForm, avatar: ""})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={securityForm.currentPassword}
                        onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={securityForm.newPassword}
                        onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Password must be at least 8 characters and include a number
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={securityForm.confirmPassword}
                        onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
                    >
                      {isLoading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
                
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
                  
                  <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Security Recommendations</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            We recommend using a strong, unique password for your account and changing it periodically.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 