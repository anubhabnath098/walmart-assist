"use client"

import { useState, useEffect } from "react"
import { Check, X, CalendarClock, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

// Types
interface QuietTimeRequest {
  id: number
  userId: string
  userName: string
  storeLocation: string
  date: string
  timeWindow: string
  reason: string
  status: "pending" | "approved" | "rejected"
}

interface ManagerDetails {
  storeId: number
  // Add other manager details as needed
}

export default function ManagerDashboardClient() {
  const [requests, setRequests] = useState<QuietTimeRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingRequestId, setUpdatingRequestId] = useState<number | null>(null)
  const router = useRouter()

  // Check if user is authenticated and load data
  useEffect(() => {
    const managerDetails = localStorage.getItem("managerDetails")

    if (!managerDetails) {
      // Redirect to login if no manager details found
      router.push("/")
      return
    }

    try {
      const manager: ManagerDetails = JSON.parse(managerDetails)
      fetchQuietTimeRequests(manager.storeId)
    } catch (err) {
      setError("Invalid manager session. Please login again.")
      router.push("/")
    }
  }, [router])

  // Fetch quiet time requests from API
  const fetchQuietTimeRequests = async (storeId: number) => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch(`/api/manager/quiettime?storeId=${storeId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch quiet time requests")
      }

      const data = await response.json()
      setRequests(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching requests")
    } finally {
      setIsLoading(false)
    }
  }

  // Update request status
  const updateRequestStatus = async (id: number, status: "approved" | "rejected") => {
    try {
      setUpdatingRequestId(id)
      setError("")

      const response = await fetch("/api/manager/quiettime", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update request status")
      }

      // Update local state
      setRequests(requests.map((request) => (request.id === id ? { ...request, status } : request)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating the request")
    } finally {
      setUpdatingRequestId(null)
    }
  }

  // Filter requests by status
  const pendingRequests = requests.filter((request) => request.status === "pending")
  const approvedRequests = requests.filter((request) => request.status === "approved")
  const rejectedRequests = requests.filter((request) => request.status === "rejected")

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading quiet time requests...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                        <p className="text-sm text-muted-foreground mb-3" suppressHydrationWarning>
                          {request.date} • {request.timeWindow}
                        </p>
                        {request.reason && <p className="text-sm bg-muted p-3 rounded mb-4">{request.reason}</p>}
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 bg-transparent"
                            onClick={() => updateRequestStatus(request.id, "rejected")}
                            disabled={updatingRequestId === request.id}
                          >
                            {updatingRequestId === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => updateRequestStatus(request.id, "approved")}
                            disabled={updatingRequestId === request.id}
                          >
                            {updatingRequestId === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
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
                        <p className="text-sm text-muted-foreground mb-3" suppressHydrationWarning>
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
