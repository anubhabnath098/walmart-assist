"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PlusCircle, Check, Clock, Bell, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Types
interface ShoppingItem {
  id: string
  name: string
  emoji: string
  reminderTime: number // minutes from now
  completed: boolean
  createdAt: number
}

interface QuietTimeRequest {
  id: string
  storeLocation: string
  date: string
  timeWindow: string
  reason: string
  status: "pending" | "approved" | "rejected"
}

export default function NeurodivergentClient() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Shopping list state
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [newItemName, setNewItemName] = useState("")
  const [newItemEmoji, setNewItemEmoji] = useState("🛒")
  const [newItemReminderMinutes, setNewItemReminderMinutes] = useState(15)
  const [reminderItem, setReminderItem] = useState<ShoppingItem | null>(null)

  // Quiet time request state
  const [quietRequests, setQuietRequests] = useState<QuietTimeRequest[]>([])
  const [storeLocation, setStoreLocation] = useState("")
  const [requestDate, setRequestDate] = useState("")
  const [timeWindow, setTimeWindow] = useState("")
  const [requestReason, setRequestReason] = useState("")
  const [requestSuccess, setRequestSuccess] = useState(false)

  // Common emojis for shopping
  const commonEmojis = ["🛒", "🥕", "🥩", "🍎", "🥛", "🧀", "🍞", "🧻", "🧼", "💊", "📱"]

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock authentication
    if (email && password) {
      setIsAuthenticated(true)
      // Load mock data
      loadMockData()
    }
  }

  // Load mock data
  const loadMockData = () => {
    // Mock shopping items
    setItems([
      {
        id: "1",
        name: "Milk",
        emoji: "🥛",
        reminderTime: 10,
        completed: false,
        createdAt: Date.now(),
      },
      {
        id: "2",
        name: "Bread",
        emoji: "🍞",
        reminderTime: 15,
        completed: false,
        createdAt: Date.now(),
      },
      {
        id: "3",
        name: "Apples",
        emoji: "🍎",
        reminderTime: 20,
        completed: false,
        createdAt: Date.now(),
      },
    ])

    // Mock quiet time requests
    setQuietRequests([
      {
        id: "1",
        storeLocation: "Walmart Supercenter - Main St",
        date: "2025-06-20",
        timeWindow: "10:00 AM - 11:00 AM",
        reason: "Sensory sensitivity to loud noises",
        status: "approved",
      },
      {
        id: "2",
        storeLocation: "Walmart Neighborhood Market - Oak Ave",
        date: "2025-06-25",
        timeWindow: "2:00 PM - 3:00 PM",
        reason: "Need a low-stimulation environment",
        status: "pending",
      },
    ])
  }

  // Add new shopping item
  const addItem = () => {
    if (newItemName.trim()) {
      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        name: newItemName,
        emoji: newItemEmoji,
        reminderTime: newItemReminderMinutes,
        completed: false,
        createdAt: Date.now(),
      }

      setItems([...items, newItem])
      setNewItemName("")
      setNewItemEmoji("🛒")
      setNewItemReminderMinutes(15)
    }
  }

  // Toggle item completion
  const toggleItemCompletion = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  // Submit quiet time request
  const submitQuietTimeRequest = (e: React.FormEvent) => {
    e.preventDefault()

    if (storeLocation && requestDate && timeWindow) {
      const newRequest: QuietTimeRequest = {
        id: Date.now().toString(),
        storeLocation,
        date: requestDate,
        timeWindow,
        reason: requestReason,
        status: "pending",
      }

      setQuietRequests([...quietRequests, newRequest])
      setRequestSuccess(true)

      // Reset form
      setStoreLocation("")
      setRequestDate("")
      setTimeWindow("")
      setRequestReason("")

      // Hide success message after 3 seconds
      setTimeout(() => {
        setRequestSuccess(false)
      }, 3000)
    }
  }

  // Check for reminders
  useEffect(() => {
    const checkReminders = setInterval(() => {
      const now = Date.now()

      items.forEach((item) => {
        if (!item.completed) {
          const reminderTime = item.createdAt + item.reminderTime * 60 * 1000
          if (now >= reminderTime) {
            setReminderItem(item)
          }
        }
      })
    }, 10000) // Check every 10 seconds

    return () => clearInterval(checkReminders)
  }, [items])

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center">
        <Card className="w-full max-w-md rounded-2xl">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Sign in to access your shopping list and quiet time requests</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">For demo purposes, enter any email and password</p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Reminder Dialog */}
      <Dialog open={!!reminderItem} onOpenChange={() => setReminderItem(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Reminder
            </DialogTitle>
            <DialogDescription>Did you forget to get this item?</DialogDescription>
          </DialogHeader>

          {reminderItem && (
            <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
              <span className="text-2xl">{reminderItem.emoji}</span>
              <span className="text-xl font-medium">{reminderItem.name}</span>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderItem(null)}>
              Dismiss
            </Button>
            <Button
              onClick={() => {
                if (reminderItem) {
                  toggleItemCompletion(reminderItem.id)
                  setReminderItem(null)
                }
              }}
            >
              Mark as Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="shopping-list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="shopping-list">Shopping List</TabsTrigger>
          <TabsTrigger value="quiet-time">Quiet Time Request</TabsTrigger>
        </TabsList>

        <TabsContent value="shopping-list" className="space-y-6">
          {/* Next Item Card */}
          {items.filter((item) => !item.completed).length > 0 && (
            <Card className="rounded-2xl border-primary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Next Item</CardTitle>
                <CardDescription>Focus on getting this item next</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const nextItem = items.find((item) => !item.completed)
                  if (nextItem) {
                    return (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{nextItem.emoji}</span>
                          <span className="text-2xl font-medium">{nextItem.name}</span>
                        </div>
                        <Button size="sm" className="rounded-full" onClick={() => toggleItemCompletion(nextItem.id)}>
                          <Check className="h-5 w-5 mr-1" /> Got It
                        </Button>
                      </div>
                    )
                  }
                })()}
              </CardContent>
            </Card>
          )}

          {/* Add Item Card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Add Item to Shopping List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <Label htmlFor="item-name">Item Name</Label>
                    <Input
                      id="item-name"
                      placeholder="Enter item name"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="item-emoji">Emoji</Label>
                    <Select value={newItemEmoji} onValueChange={setNewItemEmoji}>
                      <SelectTrigger id="item-emoji">
                        <SelectValue placeholder="🛒" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonEmojis.map((emoji) => (
                          <SelectItem key={emoji} value={emoji}>
                            {emoji}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reminder-time">Reminder (minutes)</Label>
                  <Select
                    value={newItemReminderMinutes.toString()}
                    onValueChange={(value) => setNewItemReminderMinutes(Number.parseInt(value))}
                  >
                    <SelectTrigger id="reminder-time">
                      <SelectValue placeholder="15 minutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={addItem}>Add Item</Button>
              </div>
            </CardContent>
          </Card>

          {/* Shopping List Card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Your Shopping List
              </CardTitle>
              <CardDescription>{items.filter((item) => !item.completed).length} items remaining</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Your shopping list is empty. Add some items above.
                  </p>
                ) : (
                  <>
                    {/* Pending Items */}
                    {items.filter((item) => !item.completed).length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">To Get:</h3>
                        {items
                          .filter((item) => !item.completed)
                          .map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{item.emoji}</span>
                                <span>{item.name}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-full h-8 w-8 p-0"
                                onClick={() => toggleItemCompletion(item.id)}
                              >
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Mark as completed</span>
                              </Button>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Completed Items */}
                    {items.filter((item) => item.completed).length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Got It:</h3>
                        {items
                          .filter((item) => item.completed)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-muted-foreground"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{item.emoji}</span>
                                <span className="line-through">{item.name}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-full h-8 w-8 p-0"
                                onClick={() => toggleItemCompletion(item.id)}
                              >
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Mark as not completed</span>
                              </Button>
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiet-time" className="space-y-6">
          {/* Request Success Alert */}
          {requestSuccess && (
            <Alert className="bg-green-500/10 text-green-500 border-green-500/50">
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your quiet time request has been submitted. You'll be notified when it's approved.
              </AlertDescription>
            </Alert>
          )}

          {/* Quiet Time Request Form */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5" />
                Request Quiet Shopping Time
              </CardTitle>
              <CardDescription>Submit a request for a low-stimulation shopping experience</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitQuietTimeRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store-location">Walmart Store Location</Label>
                  <Select value={storeLocation} onValueChange={setStoreLocation} required>
                    <SelectTrigger id="store-location">
                      <SelectValue placeholder="Select your Walmart store" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walmart-supercenter-main-st">
                        Walmart Supercenter - 123 Main St, Springfield
                      </SelectItem>
                      <SelectItem value="walmart-neighborhood-oak-ave">
                        Walmart Neighborhood Market - 456 Oak Ave, Springfield
                      </SelectItem>
                      <SelectItem value="walmart-supercenter-river-rd">
                        Walmart Supercenter - 789 River Rd, Springfield
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="request-date">Date</Label>
                  <Input
                    id="request-date"
                    type="date"
                    value={requestDate}
                    onChange={(e) => setRequestDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-window">Time Window</Label>
                  <Select value={timeWindow} onValueChange={setTimeWindow} required>
                    <SelectTrigger id="time-window">
                      <SelectValue placeholder="Select time window" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8:00 AM - 9:00 AM">8:00 AM - 9:00 AM</SelectItem>
                      <SelectItem value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</SelectItem>
                      <SelectItem value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</SelectItem>
                      <SelectItem value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</SelectItem>
                      <SelectItem value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</SelectItem>
                      <SelectItem value="7:00 PM - 8:00 PM">7:00 PM - 8:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="request-reason">Reason (Optional)</Label>
                  <Textarea
                    id="request-reason"
                    placeholder="Please briefly explain why you're requesting quiet shopping time"
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Previous Requests */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Your Requests</CardTitle>
              <CardDescription>Status of your quiet time requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quietRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    You haven't made any quiet time requests yet.
                  </p>
                ) : (
                  quietRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{request.storeLocation}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === "approved"
                              ? "bg-green-500/10 text-green-500"
                              : request.status === "rejected"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-yellow-500/10 text-yellow-500"
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {request.date} • {request.timeWindow}
                      </p>
                      {request.reason && <p className="text-sm mt-2 bg-muted p-2 rounded">{request.reason}</p>}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
