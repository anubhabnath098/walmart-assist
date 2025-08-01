"use client"
import React, { useState, useEffect } from "react";
import HearingImpairedClient from "./client";

interface Announcement {
  id: number
  title: string
  descrip?: string
  storeId: number
  createdAt: string
}

export default function HearingImpairedPage() {
  // announce state
  const [announcements, setAnnouncements] = useState<Announcement[]>();

  // load from API
  useEffect(() => {
      async function loadAnnouncements() {
        try {
          const res = await fetch('/api/manager/announcement');
          if (!res.ok) throw new Error(`Error: ${res.status}`);
          const data = await res.json();
          setAnnouncements(data.announcements);
        } catch (err) {
          console.error('Failed to fetch announcements:', err);
        }
      }
      loadAnnouncements();
    }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Hearing Impaired Assistance</h1>
      <p className="text-lg mb-8">
        Type in the input box to communicate with our app. We'll interpret your questions and provide text responses.
      </p>

      <HearingImpairedClient announcements={announcements} />
    </div>
  );
}
