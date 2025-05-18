"use client"

import { motion } from "framer-motion"
import { Calendar } from "lucide-react"
import Link from "next/link"

// Define a type for real events data
type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

type UpcomingEventsProps = {
  realData?: Event[];
}

export default function UpcomingEvents({ realData }: UpcomingEventsProps) {
  // Mock events to use if no real data is provided
  const mockEvents = [
    {
      id: "1",
      title: "Fundraising Gala",
      date: "2023-04-25",
      time: "18:00",
      location: "Grand Hotel",
    },
    {
      id: "2",
      title: "Volunteer Training",
      date: "2023-04-28",
      time: "10:00",
      location: "Community Center",
    },
    {
      id: "3",
      title: "Board Meeting",
      date: "2023-05-02",
      time: "14:00",
      location: "Main Office",
    },
    {
      id: "4",
      title: "Donor Appreciation",
      date: "2023-05-10",
      time: "19:00",
      location: "City Park",
    },
  ]

  // Use real data if provided, otherwise use mock data
  const events = realData && realData.length > 0 ? realData : mockEvents;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start space-x-4 rounded-lg p-3 hover:bg-gray-50"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
            <Calendar size={20} />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
            <p className="text-xs text-gray-500">
              {formatDate(event.date)} at {event.time}
            </p>
            <p className="text-xs text-gray-500">{event.location}</p>
          </div>
        </motion.div>
      ))}
      <Link 
        href="/events" 
        className="mt-2 block w-full rounded-md border border-cyan-500 py-2 text-center text-sm font-medium text-cyan-600 hover:bg-cyan-50"
      >
        View All Events
      </Link>
    </div>
  )
}
