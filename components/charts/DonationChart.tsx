"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData
} from "chart.js"
import { Donation } from "@/types"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

type DonationChartProps = {
  realData?: Donation[];
}

type ChartDataType = ChartData<'line', number[], string>;

export default function DonationChart({ realData }: DonationChartProps) {
  const [chartData, setChartData] = useState<ChartDataType>({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    // If we have real data, process it
    if (realData && realData.length > 0) {
      // Group donations by month
      const donationsByMonth = Array(12).fill(0)
      
      realData.forEach(donation => {
        const date = new Date(donation.date)
        const month = date.getMonth()
        donationsByMonth[month] += donation.amount
      })
      
      const data: ChartDataType = {
        labels,
        datasets: [
          {
            label: "Donations",
            data: donationsByMonth,
            borderColor: "rgb(6, 182, 212)",
            backgroundColor: "rgba(6, 182, 212, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      }
      
      setChartData(data)
    } else {
      // Use mock data if no real data is provided
      const data: ChartDataType = {
        labels,
        datasets: [
          {
            label: "Donations",
            data: [1500, 2200, 1800, 2400, 2800, 2100, 2600, 3200, 2900, 3500, 3800, 4200],
            borderColor: "rgb(6, 182, 212)",
            backgroundColor: "rgba(6, 182, 212, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      }
      
      setChartData(data)
    }
  }, [realData])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgb(255, 255, 255)",
        titleColor: "rgb(31, 41, 55)",
        bodyColor: "rgb(31, 41, 55)",
        borderColor: "rgb(229, 231, 235)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          labelPointStyle: () => ({
            pointStyle: "circle",
            rotation: 0,
          }),
          label: (context: any) => {
            return `$${context.raw.toLocaleString()}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgb(156, 163, 175)",
        },
      },
      y: {
        grid: {
          color: "rgb(243, 244, 246)",
        },
        ticks: {
          color: "rgb(156, 163, 175)",
          callback: (value: any) => {
            return `$${value.toLocaleString()}`
          },
        },
      },
    },
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="h-80">
      {chartData.datasets.length > 0 ? (
        <Line data={chartData} options={options as any} />
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      )}
    </motion.div>
  )
}
