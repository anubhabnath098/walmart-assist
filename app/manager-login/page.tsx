import type { Metadata } from "next"
import ManagerLoginClient from "./client"

export const metadata: Metadata = {
  title: "Manager Login",
  description: "Login to the manager dashboard",
}

export default function ManagerLoginPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manager Login</h1>
      <p className="text-lg mb-8">Login to access the manager dashboard for quiet time requests.</p>

      <ManagerLoginClient />
    </div>
  )
}
