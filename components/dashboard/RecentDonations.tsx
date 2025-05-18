"use client"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { Donation } from "@/types"
import Link from "next/link"

type RecentDonationsProps = {
  realData?: Donation[];
}

// Define a type that includes the mock data properties
type MockDonation = {
  id: string;
  donor: string;
  donorName: string;
  amount: number;
  programId: string;
  campaign: string;
  date: string;
  status: string;
}

export default function RecentDonations({ realData }: RecentDonationsProps) {
  // Mock data to use if no real data provided
  const mockDonations: MockDonation[] = [
    {
      id: "1",
      donor: "John Smith",
      donorName: "John Smith",
      amount: 250,
      programId: "clean-water",
      campaign: "Clean Water Initiative",
      date: "2023-04-15T10:30:00",
      status: "Completed",
    },
    {
      id: "2",
      donor: "Sarah Johnson",
      donorName: "Sarah Johnson",
      amount: 500,
      programId: "education",
      campaign: "Education for All",
      date: "2023-04-14T14:45:00",
      status: "Completed",
    },
    {
      id: "3",
      donor: "Michael Brown",
      donorName: "Michael Brown",
      amount: 100,
      programId: "disaster",
      campaign: "Disaster Relief",
      date: "2023-04-14T09:15:00",
      status: "Completed",
    },
    {
      id: "4",
      donor: "Emily Davis",
      donorName: "Emily Davis",
      amount: 75,
      programId: "clean-water",
      campaign: "Clean Water Initiative",
      date: "2023-04-13T16:20:00",
      status: "Completed",
    },
    {
      id: "5",
      donor: "David Wilson",
      donorName: "David Wilson",
      amount: 1000,
      programId: "education",
      campaign: "Education for All",
      date: "2023-04-13T11:05:00",
      status: "Completed",
    },
  ]

  // Use real data if provided, otherwise use mock data
  const donations = realData && realData.length > 0 ? realData : mockDonations;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Helper function to get the display text for the program
  const getProgramName = (donation: Donation | MockDonation) => {
    // If it's a mock donation with campaign property
    if ('campaign' in donation) {
      return donation.campaign;
    }
    // Otherwise just show the program ID
    return "Program " + donation.programId;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500">
            <th className="pb-3 pl-4 pr-3">Donor</th>
            <th className="pb-3 px-3">Amount</th>
            <th className="pb-3 px-3">Program</th>
            <th className="pb-3 px-3">Date</th>
            <th className="pb-3 px-3">Status</th>
           
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {donations.map((donation, index) => (
            <motion.tr
              key={donation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="text-sm text-gray-900"
            >
              <td className="whitespace-nowrap py-4 pl-4 pr-3 font-medium">{donation.donorName}</td>
              <td className="whitespace-nowrap px-3 py-4 font-medium text-cyan-600">Rs{donation.amount.toLocaleString()}</td>
              <td className="whitespace-nowrap px-3 py-4">{getProgramName(donation)}</td>
              <td className="whitespace-nowrap px-3 py-4 text-gray-500">{formatDate(donation.date)}</td>
              <td className="whitespace-nowrap px-3 py-4">
                <span className="badge badge-success">{donation.status}</span>
              </td>
           
            </motion.tr>
          ))}
          
          {donations.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500">
                No donations found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
