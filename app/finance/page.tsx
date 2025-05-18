"use client"

import { motion } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
} from "lucide-react"
import Link from "next/link"
import { Bar, Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default function FinancePage() {
  const stats = [
    {
      title: "Total Income",
      value: "$124,320",
      change: "+8.2%",
      increasing: true,
      icon: <TrendingUp className="h-5 w-5 text-cyan-600" />,
    },
    {
      title: "Total Expenses",
      value: "$86,450",
      change: "+5.1%",
      increasing: true,
      icon: <TrendingDown className="h-5 w-5 text-cyan-600" />,
    },
    {
      title: "Net Balance",
      value: "$37,870",
      change: "+12.5%",
      increasing: true,
      icon: <DollarSign className="h-5 w-5 text-cyan-600" />,
    },
    {
      title: "Budget Utilization",
      value: "72%",
      change: "-3.4%",
      increasing: false,
      icon: <PieChart className="h-5 w-5 text-cyan-600" />,
    },
  ]

  const incomeData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Income",
        data: [12500, 15200, 18300, 14500, 16800, 19200],
        backgroundColor: "rgba(6, 182, 212, 0.8)",
      },
      {
        label: "Expenses",
        data: [8200, 9500, 11200, 10800, 12300, 13500],
        backgroundColor: "rgba(20, 184, 166, 0.8)",
      },
    ],
  }

  const expenseBreakdownData = {
    labels: ["Programs", "Administration", "Fundraising", "Operations", "Marketing"],
    datasets: [
      {
        data: [45, 20, 15, 12, 8],
        backgroundColor: [
          "rgba(6, 182, 212, 0.8)",
          "rgba(20, 184, 166, 0.8)",
          "rgba(14, 116, 144, 0.8)",
          "rgba(8, 145, 178, 0.8)",
          "rgba(59, 130, 246, 0.8)",
        ],
        borderColor: [
          "rgba(6, 182, 212, 1)",
          "rgba(20, 184, 166, 1)",
          "rgba(14, 116, 144, 1)",
          "rgba(8, 145, 178, 1)",
          "rgba(59, 130, 246, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            return `$${value.toLocaleString()}`
          },
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.raw}%`,
        },
      },
    },
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
        <div className="flex space-x-2">
          <button className="btn btn-outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </button>
          <button className="btn btn-primary">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-cyan-50 p-3">{stat.icon}</div>
              <span
                className={`flex items-center text-xs font-medium ${
                  stat.increasing ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change}
                {stat.increasing ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Income vs Expenses</h3>
            <div className="flex items-center space-x-2">
              <select className="rounded-md border border-gray-300 py-1 pl-3 pr-8 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500">
                <option>Last 6 months</option>
                <option>Last 12 months</option>
                <option>Last 3 months</option>
              </select>
            </div>
          </div>
          <div className="p-6">
            <div className="h-80">
              <Bar data={incomeData} options={barOptions} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Expense Breakdown</h3>
            <div className="flex items-center space-x-2">
              <select className="rounded-md border border-gray-300 py-1 pl-3 pr-8 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500">
                <option>Current Year</option>
                <option>Previous Year</option>
              </select>
            </div>
          </div>
          <div className="p-6">
            <div className="h-80">
              <Doughnut data={expenseBreakdownData} options={doughnutOptions} />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          <Link href="/finance/transactions" className="text-sm font-medium text-cyan-600 hover:text-cyan-500">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500">
                <th className="px-6 py-3">Transaction ID</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                {
                  id: "TRX-001",
                  date: "2023-04-15",
                  description: "Donation from John Smith",
                  category: "Income",
                  amount: 250,
                  status: "Completed",
                },
                {
                  id: "TRX-002",
                  date: "2023-04-14",
                  description: "Office Supplies",
                  category: "Expense",
                  amount: -120,
                  status: "Completed",
                },
                {
                  id: "TRX-003",
                  date: "2023-04-13",
                  description: "Corporate Sponsorship",
                  category: "Income",
                  amount: 5000,
                  status: "Completed",
                },
                {
                  id: "TRX-004",
                  date: "2023-04-12",
                  description: "Staff Salaries",
                  category: "Expense",
                  amount: -3500,
                  status: "Completed",
                },
                {
                  id: "TRX-005",
                  date: "2023-04-10",
                  description: "Program Expenses",
                  category: "Expense",
                  amount: -750,
                  status: "Pending",
                },
              ].map((transaction, index) => (
                <tr key={transaction.id} className="text-sm text-gray-900">
                  <td className="whitespace-nowrap px-6 py-4 font-medium">{transaction.id}</td>
                  <td className="whitespace-nowrap px-6 py-4">{new Date(transaction.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{transaction.description}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`badge ${transaction.category === "Income" ? "badge-success" : "badge-warning"}`}>
                      {transaction.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium">
                    <span className={transaction.amount > 0 ? "text-green-600" : "text-red-600"}>
                      ${Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`badge ${transaction.status === "Completed" ? "badge-primary" : "badge-secondary"}`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
