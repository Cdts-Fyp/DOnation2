"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ChevronDown, LogIn, UserCircle, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // This would be replaced with your auth state

  // Check if user is scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // For demo purposes - in real app, you'd use your auth system
  useEffect(() => {
    // Check if user is logged in from localStorage or session
    const checkLoginStatus = () => {
      const token = localStorage.getItem("auth_token")
      setIsLoggedIn(!!token)
    }
    checkLoginStatus()
  }, [])

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white py-2 shadow-md" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
              <span className="text-xl font-bold">GH</span>
            </div>
            <span className={`text-xl font-bold ${isScrolled ? "text-gray-900" : "text-white"}`}>GlobalHope</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {/* Commented out navigation items
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={isScrolled ? "ghost" : "link"} className={isScrolled ? "text-gray-700" : "text-white"}>
                  Programs <ChevronDown size={16} className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem>
                  <Link href="/programs/clean-water" className="flex w-full">
                    Clean Water
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/programs/education" className="flex w-full">
                    Education
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/programs/healthcare" className="flex w-full">
                    Healthcare
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/programs" className="flex w-full">
                    View All Programs
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant={isScrolled ? "ghost" : "link"}
              className={isScrolled ? "text-gray-700" : "text-white"}
              asChild
            >
              <Link href="/about">About Us</Link>
            </Button>

            <Button
              variant={isScrolled ? "ghost" : "link"}
              className={isScrolled ? "text-gray-700" : "text-white"}
              asChild
            >
              <Link href="/impact">Our Impact</Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={isScrolled ? "ghost" : "link"} className={isScrolled ? "text-gray-700" : "text-white"}>
                  Resources <ChevronDown size={16} className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem>
                  <Link href="/blog" className="flex w-full">
                    Blog
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/resources/reports" className="flex w-full">
                    Impact Reports
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/resources/faq" className="flex w-full">
                    FAQ
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant={isScrolled ? "ghost" : "link"}
              className={isScrolled ? "text-gray-700" : "text-white"}
              asChild
            >
              <Link href="/contact">Contact</Link>
            </Button>
            */}
          </nav>

          {/* Auth Buttons or User Menu */}
          <div className="hidden items-center gap-2 md:flex">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} className={isScrolled ? "text-gray-700" : "text-white"} />
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-cyan-500 p-0 text-[10px]">3</Badge>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/images/avatar.jpg" alt="User" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <span className={isScrolled ? "text-gray-700" : "text-white"}>John Doe</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>
                      <Link href="/dashboard" className="flex w-full items-center gap-2">
                        <UserCircle size={16} />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/dashboard/donations" className="flex w-full">
                        My Donations
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/dashboard/settings" className="flex w-full">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <button
                        className="flex w-full text-red-500"
                        onClick={() => {
                          localStorage.removeItem("auth_token")
                          setIsLoggedIn(false)
                        }}
                      >
                        Logout
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Button
                  variant={isScrolled ? "outline" : "ghost"}
                  className={!isScrolled ? "text-white border-white" : undefined}
                  asChild
                >
                  <Link href="/login">
                    <LogIn size={18} className="mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  asChild
                >
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}

            {/* Search button - commented out
            <Button variant="ghost" size="icon" className={isScrolled ? "text-gray-700" : "text-white"}>
              <Search size={20} />
            </Button>
            */}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden ${isScrolled ? "text-gray-700" : "text-white"}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 top-full w-full bg-white py-4 shadow-lg md:hidden">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col gap-2">
              {/* Commented out mobile navigation items
              <Link
                href="/programs"
                className="flex items-center justify-between rounded-md p-3 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Programs
                <ChevronDown size={16} />
              </Link>
              <Link
                href="/about"
                className="rounded-md p-3 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/impact"
                className="rounded-md p-3 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Our Impact
              </Link>
              <Link
                href="/resources"
                className="flex items-center justify-between rounded-md p-3 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
                <ChevronDown size={16} />
              </Link>
              <Link
                href="/contact"
                className="rounded-md p-3 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              */}

              <div className="my-2 border-t border-gray-200"></div>

              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-md p-3 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/donations"
                    className="rounded-md p-3 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Donations
                  </Link>
                  <button
                    className="rounded-md p-3 text-left text-red-500 hover:bg-gray-100"
                    onClick={() => {
                      localStorage.removeItem("auth_token")
                      setIsLoggedIn(false)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button asChild>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    asChild
                  >
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
