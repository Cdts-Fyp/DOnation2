"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Plus, MoreHorizontal, Download, Edit, Mail } from "lucide-react"
import Link from "next/link"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("All")

  const users = [
    {
      id: 1,
      name: "Ehsan Khan",
      email: "ehsankhan@gmail.com",
      role: "Donor",
      status: "Active",
      lastDonation: "2023-04-10",
      totalDonations: 1250,
    },
    {
      id: 2,
      name: "Sara Ali",
      email: "saraali@gmail.com",
      role: "Donor",
      status: "Active",
      lastDonation: null,
      totalDonations: 0,
    },
    {
      id: 3,
      name: "Anes Khan",
      email: "aneskhan@gmail.com",
      role: "Donor",
      status: "Active",
      lastDonation: "2023-04-05",
      totalDonations: 750,
    },
    {
      id: 4,
      name: "Ayesha Khan",
      email: "ayeshakhan@gmail.com",
      role: "Donor",
      status: "Active",
      lastDonation: null,
      totalDonations: 0,
    },
    {
      id: 5,
      name: "Aneesh kumar",
      email: "aneeshkumar@gmail.com",
      role: "Donor",
      status: "Inactive",
      lastDonation: null,
      totalDonations: 0,
    },
    {
      id: 6,
      name: "Sejal",
      email: "sejal@gmail.com",
      role: "Donor",
      status: "Active",
      lastDonation: "2023-03-28",
      totalDonations: 2000,
    },
    {
      id: 7,
      name: "Rajesh Kumar",
      email: "rajeshkumar@gmail.com",
      role: "Donor",
      status: "Active",
      lastDonation: null,
      totalDonations: 0,
    },
  ]

  const roles = ["All", "Donor", "Volunteer", "Charity Administrator", "Accountant"]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "All" || user.role === selectedRole

    return matchesSearch && matchesRole
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        {/* <Link href="/users/add" className="btn btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Link> */}
      </div>

      <div className="card">
        <div className="border-b border-gray-200 p-4 sm:flex sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div className="mt-3 flex items-center space-x-2 sm:mt-0">
            <div className="flex items-center space-x-2">
              {/* <Filter className="h-5 w-5 text-gray-400" /> */}
              {/* <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="rounded-md border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select> */}
            </div>
            {/* <button className="btn btn-outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </button> */}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Donation</th>
                <th className="px-4 py-3">Total Donations</th>
                {/* <th className="px-4 py-3 text-right">Actions</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="text-sm text-gray-900">
                  <td className="whitespace-nowrap px-4 py-4 font-medium">{user.name}</td>
                  <td className="whitespace-nowrap px-4 py-4">{user.email}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`badge ${
                        user.role === "Donor"
                          ? "badge-primary"
                          : user.role === "Volunteer"
                            ? "badge-secondary"
                            : user.role === "Charity Administrator"
                              ? "badge-success"
                              : "badge-warning"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className={`badge ${user.status === "Active" ? "badge-success" : "badge-danger"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-gray-500">{formatDate(user.lastDonation)}</td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium">
                    {user.totalDonations > 0 ? `$${user.totalDonations.toLocaleString()}` : "N/A"}
                  </td>
                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-200 px-4 py-3 sm:flex sm:items-center sm:justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{filteredUsers.length}</span> of{" "}
            <span className="font-medium">{users.length}</span> users
          </div>
          <div className="mt-3 flex items-center justify-between sm:mt-0">
            <button className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Previous
            </button>
            <div className="mx-2 text-sm text-gray-700">Page 1 of 1</div>
            <button className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
