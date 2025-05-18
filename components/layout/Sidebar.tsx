"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LogOut, ChevronRight } from "lucide-react"
import { useNavigation, NavItem } from "@/contexts/navigation-context"
import { useAuth } from "@/contexts/auth-context"

interface SidebarProps {
  setSidebarOpen: (open: boolean) => void
}

export default function Sidebar({ setSidebarOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { visibleNavItems } = useNavigation()
  const { user, logout } = useAuth()

  // Update active section when pathname changes
  useEffect(() => {
    // Find the nav item that matches the current path
    const matchingItem = visibleNavItems.find(item => {
      // Special case for Dashboard - only active when exactly "/"
      if (item.href === "/" && pathname === "/") {
        return true
      }
      // For other items, check if pathname starts with item.href but only if item.href is not "/"
      return item.href !== "/" && pathname.startsWith(item.href)
    })
    
    if (matchingItem) {
      setActiveSection(matchingItem.title)
    }
  }, [pathname, visibleNavItems])

  const toggleSection = (title: string) => {
    if (activeSection === title) {
      setActiveSection(null)
    } else {
      setActiveSection(title)
    }
  }

  // Helper function to determine if an item should be highlighted as active
  const isItemActive = (item: any) => {
    // Dashboard is active only when pathname is exactly "/"
    if (item.href === "/" && pathname === "/") {
      return true
    }
    // Other items are active if the pathname starts with their href (but not for the root path "/")
    return item.href !== "/" && pathname.startsWith(item.href)
  }

  // Handle item click - either navigate or toggle dropdown
  const handleItemClick = (item: NavItem) => {
    // If item has subitems, toggle the dropdown
    if (item.subItems && item.subItems.length > 0) {
      toggleSection(item.title);
    } else {
      // If no subitems, navigate using Next.js router instead of window.location
      router.push(item.href);
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-r from-cyan-500 to-teal-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
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
          <span className="text-xl font-bold text-gray-900">CharityTrack</span>
        </Link>
      </div>
      
      {user && (
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 uppercase font-bold">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {visibleNavItems.map((item) => (
            <li key={item.title}>
              <button
                onClick={() => handleItemClick(item)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
                  isItemActive(item)
                    ? "bg-cyan-50 text-cyan-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500">{item.icon}</span>
                  <span>{item.title}</span>
                </div>
                {item.subItems && (
                <ChevronRight
                  size={16}
                  className={`transition-transform duration-200 ${activeSection === item.title ? "rotate-90" : ""}`}
                />
                )}
              </button>
              {activeSection === item.title && item.subItems && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 space-y-1 pl-10"
                >
                  {item.subItems.map((subItem) => (
                    <li key={subItem.title}>
                      <Link
                        href={subItem.href}
                        className={`block rounded-md px-3 py-2 text-sm font-medium ${
                          pathname === subItem.href
                            ? "bg-cyan-50 text-cyan-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {subItem.title}
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-gray-200 p-4">
        <button 
          onClick={logout}
          className="flex w-full items-center justify-center space-x-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
