import type { Metadata } from "next"
import ManagerDashboardClient from "./client"

export const metadata: Metadata = {
  title: "Manager Dashboard",
  description: "Manage quiet time requests",
}

export default function ManagerDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>
      <p className="text-lg mb-8">Review and manage quiet time requests from customers.</p>

      <ManagerDashboardClient />
    </div>
  )
}
