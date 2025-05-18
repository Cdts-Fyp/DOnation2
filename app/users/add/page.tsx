"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Check, X } from "lucide-react"
import Link from "next/link"

export default function AddUserPage() {
  const [password, setPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)

    // Calculate password strength
    let strength = 0
    if (newPassword.length >= 8) strength += 1
    if (/[A-Z]/.test(newPassword)) strength += 1
    if (/[0-9]/.test(newPassword)) strength += 1
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1

    setPasswordStrength(strength)
  }

  const getStrengthText = () => {
    if (password.length === 0) return ""
    if (passwordStrength === 1) return "Weak"
    if (passwordStrength === 2) return "Fair"
    if (passwordStrength === 3) return "Good"
    if (passwordStrength === 4) return "Strong"
    return ""
  }

  const getStrengthColor = () => {
    if (password.length === 0) return "bg-gray-200"
    if (passwordStrength === 1) return "bg-red-500"
    if (passwordStrength === 2) return "bg-yellow-500"
    if (passwordStrength === 3) return "bg-blue-500"
    if (passwordStrength === 4) return "bg-green-500"
    return "bg-gray-200"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center">
        <Link
          href="/users"
          className="mr-4 flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
      </div>

      <div className="card p-6">
        <form className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
                required
              />
              {password && (
                <div className="mt-2">
                  <div className="flex h-1 w-full overflow-hidden rounded-full bg-gray-200">
                    <motion.div
                      className={`${getStrengthColor()}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength / 4) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Password Strength: <span className="font-medium">{getStrengthText()}</span>
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-gray-500">
                    <li className="flex items-center">
                      {password.length >= 8 ? (
                        <Check className="mr-1 h-3 w-3 text-green-500" />
                      ) : (
                        <X className="mr-1 h-3 w-3 text-red-500" />
                      )}
                      At least 8 characters
                    </li>
                    <li className="flex items-center">
                      {/[A-Z]/.test(password) ? (
                        <Check className="mr-1 h-3 w-3 text-green-500" />
                      ) : (
                        <X className="mr-1 h-3 w-3 text-red-500" />
                      )}
                      At least one uppercase letter
                    </li>
                    <li className="flex items-center">
                      {/[0-9]/.test(password) ? (
                        <Check className="mr-1 h-3 w-3 text-green-500" />
                      ) : (
                        <X className="mr-1 h-3 w-3 text-red-500" />
                      )}
                      At least one number
                    </li>
                    <li className="flex items-center">
                      {/[^A-Za-z0-9]/.test(password) ? (
                        <Check className="mr-1 h-3 w-3 text-green-500" />
                      ) : (
                        <X className="mr-1 h-3 w-3 text-red-500" />
                      )}
                      At least one special character
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                User Role
              </label>
              <select
                id="role"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
                required
              >
                <option value="">Select a role</option>
                <option value="donor">Donor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          

          <div className="flex justify-end space-x-3">
            <Link href="/users" className="btn btn-outline">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary">
              Create User
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
