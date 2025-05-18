"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface RouteGuardProps {
  children: React.ReactNode
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const publicPaths = ["/", "/login", "/register", "/forgot-password", "/admin-signup"]
  const isPublicPath = publicPaths.includes(pathname) || 
                       pathname.startsWith("/programs/public") || 
                       pathname === "/reset-password" ||
                       pathname.startsWith("/reset-password")

  useEffect(() => {
    // Auth check logic
    if (!isLoading) {
      // Redirect to onboarding if the user hasn't completed it yet
      if (isAuthenticated && user && !user.onboardingCompleted && !pathname.includes("/onboarding") && !isPublicPath) {
        router.push("/onboarding")
        return
      }
      
      if (!isAuthenticated && !isPublicPath) {
        // Redirect to login if not authenticated and trying to access protected route
        router.push("/login")
      } else if (isAuthenticated && isPublicPath && !pathname.startsWith("/programs/public") && pathname !== "/") {
        // Redirect to dashboard if authenticated and trying to access public route
        // But allow access to public program views and the homepage
        router.push("/")
      }
    }
  }, [isAuthenticated, isLoading, isPublicPath, router, user, pathname])

  // Role-based route guard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Admin only routes
      const adminRoutes = ["/users", "/finance", "/admin"]
      
      // Donor only routes
      const donorRoutes = ["/my-donations", "/impact"]
      
      // Volunteer only routes
      const volunteerRoutes = ["/volunteer-dashboard"]
      
      if (
        adminRoutes.some(route => pathname.startsWith(route)) && 
        user.role !== "admin"
      ) {
        router.push("/")
      }
      
      if (
        donorRoutes.some(route => pathname.startsWith(route)) && 
        user.role !== "donor" && user.role !== "admin" // Admins can view donor pages
      ) {
        router.push("/")
      }
      
      if (
        volunteerRoutes.some(route => pathname.startsWith(route)) && 
        user.role !== "volunteer" && user.role !== "admin" // Admins can view volunteer pages
      ) {
        router.push("/")
      }
    }
  }, [pathname, user, isAuthenticated, isLoading, router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-cyan-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600 text-center">
          Verifying your authentication status...
          <br />
          <span className="text-sm text-gray-500 mt-1">Please wait a moment</span>
        </p>
      </div>
    )
  }

  // Render children only if authorized or public path
  return isAuthenticated || isPublicPath ? <>{children}</> : null
} 