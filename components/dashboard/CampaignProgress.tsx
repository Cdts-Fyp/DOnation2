"use client"

import { motion } from "framer-motion"
import { Program } from "@/types"

type CampaignProgressProps = {
  realData?: Program[];
}

export default function CampaignProgress({ realData }: CampaignProgressProps) {
  // Mock data to use if no real data is provided
  const mockCampaigns = [
    {
      id: "1",
      title: "Clean Water Initiative",
      target: 50000,
      raised: 32500,
      color: "cyan",
    },
    {
      id: "2",
      title: "Education for All",
      target: 75000,
      raised: 45000,
      color: "teal",
    },
    {
      id: "3",
      title: "Disaster Relief",
      target: 100000,
      raised: 87500,
      color: "blue",
    },
  ]

  // Use real data if provided, otherwise use mock data
  const campaigns = realData && realData.length > 0
    ? realData.map(program => ({
        id: program.id,
        name: program.title,
        goal: program.target,
        raised: program.raised,
        color: getColorByPercentage(program.raised / program.target)
      }))
    : mockCampaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.title,
        goal: campaign.target,
        raised: campaign.raised,
        color: campaign.color
      }));

  // Function to determine color based on funding percentage
  function getColorByPercentage(percentage: number): string {
    if (percentage < 0.3) return "red";
    if (percentage < 0.6) return "amber";
    if (percentage < 0.8) return "teal";
    return "green";
  }

  // Function to get Tailwind color class
  function getColorClass(color: string): string {
    switch (color) {
      case "cyan":
        return "bg-cyan-500";
      case "teal":
        return "bg-teal-500";
      case "blue":
        return "bg-blue-500";
      case "red":
        return "bg-red-500";
      case "amber":
        return "bg-amber-500";
      case "green":
        return "bg-green-500";
      default:
        return "bg-cyan-500";
    }
  }


  return (
    <div className="space-y-6">
      {campaigns.map((campaign) => {
        const percentage = Math.round((campaign.raised / campaign.goal) * 100)
        const colorClass = getColorClass(campaign.color)

        return (
          <div key={campaign.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">{campaign.name}</h4>
              <span className="text-xs font-medium text-gray-500">
                Rs{campaign.raised.toLocaleString()} of Rs{campaign.goal.toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <motion.div
                className={`h-full ${colorClass}`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">{percentage}% Complete</span>
              <span className="text-xs font-medium text-gray-500">
                Rs{(campaign.goal - campaign.raised).toLocaleString()} to go
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
