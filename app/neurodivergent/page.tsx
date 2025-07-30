"use client"
import NeurodivergentClient from "./client"
import LogoutButton from "../../components/logout-button"
import { useEffect, useState } from "react"


export default function NeurodivergentPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  useEffect(()=>{
    const userId = localStorage.getItem("userId");
    if(userId) {
      setIsLoggedIn(true);
    }
  },[])
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Neurodivergent Assistance</h1>
        </div>
        {isLoggedIn &&<LogoutButton isLoggedIn = {isLoggedIn}/>}
      </div>
      <p className="text-lg mb-8">
        Create shopping lists with reminders and request quiet shopping times for a distraction-free experience.
      </p>
      <NeurodivergentClient />
    </div>
  )
}
