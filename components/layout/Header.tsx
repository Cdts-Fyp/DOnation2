"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Bell, Search, ChevronDown } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { motion, AnimatePresence } from "framer-motion"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  // Mock notifications - in a real app this would come from context
  const notifications = [
    {
      id: 1,
      title: "New donation received",
      message: "You received a new donation of $50",
      time: "5 minutes ago",
      read: false
    },
    {
      id: 2,
      title: "Campaign goal reached",
      message: "Winter Relief campaign has reached its goal",
      time: "1 hour ago",
      read: false
    },
    {
      id: 3,
      title: "New campaign launched",
      message: "Education Fund campaign has been launched",
      time: "1 day ago",
      read: true
    }
  ]
  
  const unreadCount = notifications.filter(n => !n.read).length

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
      <div className="flex items-center">
        <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-600 focus:outline-none"
        >
            {sidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
        </button>
       
      </div>
      <div className="flex items-center space-x-4">
          
        <div className="relative">
            <div>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-sm focus:outline-none"
              >
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 uppercase font-bold">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      user?.name.charAt(0)
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-400 border-2 border-white"></span>
                </div>
                <div className="hidden md:flex md:items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                </div>
              </button>
            </div>
            <AnimatePresence>
          {showUserMenu && (
            <motion.div
                  initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20"
            >
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <p className="text-xs text-gray-400 capitalize mt-1">
                      {user?.role} Account
                    </p>
              </div>
                  <div className="py-1">
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                Settings
                    </Link>
                    {user?.role === "admin" ? (
                      <Link
                        href="/"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                    ) : user?.role === "donor" ? (
                      <Link
                        href="/my-donations"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Donations
                      </Link>
                    ) : null}
                  
                  </div>
                  <div className="py-1 border-t border-gray-200">
                    <button
                      onClick={() => logout()}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                  Sign out
                </button>
              </div>
            </motion.div>
          )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
