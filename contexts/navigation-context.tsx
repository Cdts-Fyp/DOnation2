"use client"

import React, { createContext, useContext } from "react"
import { useAuth } from "./auth-context"
import { Users, Heart, DollarSign, Briefcase, BarChart4, Settings, Award, Bookmark, History } from "lucide-react"

export interface NavItem {
  title: string
  icon: React.ReactNode
  href: string
  subItems?: { title: string; href: string }[]
  roles: string[] // which roles can see this item
}

interface NavigationContextType {
  navItems: NavItem[]
  visibleNavItems: NavItem[]
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

// Define all navigation items
const allNavItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: <Users size={20} />,
    href: "/",
    roles: ["admin", "donor", "volunteer"],
  },
  {
    title: "User Management",
    icon: <Users size={20} />,
    href: "/users",
    subItems: [
      { title: "All Users", href: "/users" },
      { title: "Add User", href: "/users/add" },
      // { title: "User Roles", href: "/users/roles" },
    ],
    roles: ["admin"],
  },
  {
    title: "Donation Management",
    icon: <Heart size={20} />,
    href: "/donations",
    subItems: [
      { title: "Donations Overview", href: "/donations" },
      // { title: "Add Donation", href: "/donations/new" },
    ],
    roles: ["admin"],
  },
  {
    title: "My Donations",
    icon: <Heart size={20} />,
    href: "/my-donations",
    subItems: [
      { title: "Make a Donation", href: "/my-donations/new" },
      { title: "My Donation History", href: "/my-donations/history" },
    ],
    roles: ["donor"],
  },
//   {
//     title: "Financial Management",
//     icon: <DollarSign size={20} />,
//     href: "/finance",
//     subItems: [
//       { title: "Financial Overview", href: "/finance" },
//       { title: "Transactions", href: "/finance/transactions" },
//       { title: "Budget Allocation", href: "/finance/budget" },
//     ],
//     roles: ["admin"],
//   },
  {
    title: "Program Management",
    icon: <Briefcase size={20} />,
    href: "/programs",
    subItems: [
      { title: "Programs Overview", href: "/programs" },
      { title: "Create Program", href: "/programs/new" },
      { title: "Program Details", href: "/programs/details" },
    ],
    roles: ["admin"],
  },
  {
    title: "Programs",
    icon: <Award size={20} />,
    href: "/programs/public",
    subItems: [
      { title: "All Programs", href: "/programs/public" },
      { title: "Featured Programs", href: "/programs/public/featured" },
    ],
    roles: ["donor", "volunteer"],
  },
  {
    title: "Analytics & Reports",
    icon: <BarChart4 size={20} />,
    href: "/analytics",
    subItems: [
      { title: "Dashboard", href: "/analytics" },
      { title: "Generate Reports", href: "/analytics/reports" },
      { title: "Donor Analytics", href: "/analytics/donors" },
    ],
    roles: ["admin"],
  },
//   {
//     title: "My Impact",
//     icon: <BarChart4 size={20} />,
//     href: "/impact",
//     subItems: [
//       { title: "Donation Impact", href: "/impact" },
//       { title: "Impact Certificates", href: "/impact/certificates" },
//     ],
//     roles: ["donor"],
//   },
//   {
//     title: "Saved Items",
//     icon: <Bookmark size={20} />,
//     href: "/saved",
//     roles: ["donor", "volunteer"],
//   },

  {
    title: "Settings",
    icon: <Settings size={20} />,
    href: "/settings",
    subItems: [
      { title: "Account Settings", href: "/settings" }
    ],
    roles: ["admin", "donor", "volunteer"],
  },
]

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  
  // Filter nav items based on user role
  const visibleNavItems = user
    ? allNavItems.filter(item => item.roles.includes(user.role))
    : []
  
  return (
    <NavigationContext.Provider value={{ navItems: allNavItems, visibleNavItems }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
} 