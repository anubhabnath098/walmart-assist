"use client"

import { useState, useEffect } from "react"
import { Check, X, CalendarClock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

// Types
interface QuietTimeRequest {
  id: string
  userId: string
  userName: string
  storeLocation: string
  date: string
  timeWindow: string
  reason: string
  status: "pending" | "approved" | "rejected"
}

export default function ManagerDashboardClient() {
  const [requests, setRequests] = useState<QuietTimeRequest[]>([])
  const router = useRouter()

  // Check if user is authenticated as manager
  useEffect(() => {
    // In a real app, this would verify the user's session
    // For demo purposes, we'll just load mock data
    loadMockData()
  }, [])

  // Load mock data
  const loadMockData = () => {
    setRequests([
      {
        id: "1",
        userId: "user123",
        userName: "Alex Johnson",
        storeLocation: "Walmart Supercenter - Main St",
        date: "2025-06-20",
        timeWindow: "10:00 AM - 11:00 AM",
        reason: "I have sensory processing issues and would appreciate a quieter shopping environment.",
        status: "pending",
      },
      {
        id: "2",
        userId: "user456",
        userName: "Sam Taylor",
        storeLocation: "Walmart Neighborhood Market - Oak Ave",
        date: "2025-06-25",
        timeWindow: "2:00 PM - 3:00 PM",
        reason: "My child has autism and gets overwhelmed in busy stores.",
        status: "pending",
      },
      {
        id: "3",
        userId: "user789",
        userName: "Jordan Smith",
        storeLocation: "Walmart Supercenter - River Rd",
        date: "2025-06-18",
        timeWindow: "9:00 AM - 10:00 AM",
        reason: "I have ADHD and find it difficult to focus in noisy environments.",
        status: "approved",
      },
      {
        id: "4",
        userId: "user101",
        userName: "Casey Brown",
        storeLocation: "Walmart Supercenter - Main St",
        date: "2025-06-15",
        timeWindow: "7:00 PM - 8:00 PM",
        reason: "I experience anxiety in crowded places.",
        status: "rejected",
      },
    ])
  }

  // Update request status
  const updateRequestStatus = (id: string, status: "approved" | "rejected") => {
    setRequests(requests.map((request) => (request.id === id ? { ...request, status } : request)))
  }

  // Filter requests by status
  const pendingRequests = requests.filter((request) => request.status === "pending")
  const approvedRequests = requests.filter((request) => request.status === "approved")
  const rejectedRequests = requests.filter((request) => request.status === "rejected")

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending">
            Pending
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5" />
                Pending Quiet Time Requests
              </CardTitle>
              <CardDescription>Review and approve or reject customer requests</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No pending requests at this time.</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id} className="rounded-lg">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{request.userName}</h3>
                          <Badge>Pending</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{request.storeLocation}</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {request.date} • {request.timeWindow}
                        </p>
                        {request.reason && <p className="text-sm bg-muted p-3 rounded mb-4">{request.reason}</p>}
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => updateRequestStatus(request.id, "rejected")}
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => updateRequestStatus(request.id, "approved")}
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Approved Requests</CardTitle>
              <CardDescription>Quiet time requests that have been approved</CardDescription>
            </CardHeader>
            <CardContent>
              {approvedRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No approved requests at this time.</p>
              ) : (
                <div className="space-y-4">
                  {approvedRequests.map((request) => (
                    <Card key={request.id} className="rounded-lg">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{request.userName}</h3>
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/50">
                            Approved
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{request.storeLocation}</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {request.date} • {request.timeWindow}
                        </p>
                        {request.reason && <p className="text-sm bg-muted p-3 rounded">{request.reason}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Rejected Requests</CardTitle>
              <CardDescription>Quiet time requests that have been rejected</CardDescription>
            </CardHeader>
            <CardContent>
              {rejectedRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No rejected requests at this time.</p>
              ) : (
                <div className="space-y-4">
                  {rejectedRequests.map((request) => (
                    <Card key={request.id} className="rounded-lg">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{request.userName}</h3>
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/50">
                            Rejected
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{request.storeLocation}</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {request.date} • {request.timeWindow}
                        </p>
                        {request.reason && <p className="text-sm bg-muted p-3 rounded">{request.reason}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
