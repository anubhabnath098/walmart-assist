import type { Metadata } from "next"
import HearingImpairedClient from "./client"

export const metadata: Metadata = {
  title: "Hearing Impaired Assistance",
  description: "Sign language interpretation for hearing impaired users",
}

export default function HearingImpairedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Hearing Impaired Assistance</h1>
      <p className="text-lg mb-8">
        Use sign language to communicate with our app. We'll interpret your gestures and provide text responses.
      </p>

      <HearingImpairedClient />
    </div>
  )
}
