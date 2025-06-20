import type { Metadata } from "next"
import VisuallyImpairedClient from "./client"

export const metadata: Metadata = {
  title: "Visually Impaired Assistance",
  description: "Voice-guided shopping assistance for visually impaired users",
}

export default function VisuallyImpairedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Visually Impaired Assistance</h1>
      <p className="text-lg mb-8">
        Use voice commands to navigate the store and identify products. Our assistant will describe what's in front of
        you.
      </p>

      <VisuallyImpairedClient />
    </div>
  )
}
