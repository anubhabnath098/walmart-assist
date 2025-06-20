import type { Metadata } from "next"
import NeurodivergentClient from "./client"

export const metadata: Metadata = {
  title: "Neurodivergent Assistance",
  description: "Focused shopping experience for neurodivergent users",
}

export default function NeurodivergentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Neurodivergent Assistance</h1>
      <p className="text-lg mb-8">
        Create shopping lists with reminders and request quiet shopping times for a distraction-free experience.
      </p>

      <NeurodivergentClient />
    </div>
  )
}
