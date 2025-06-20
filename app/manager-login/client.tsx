"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ManagerLoginClient() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const [storeLocation, setStoreLocation] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (!email || !password || !storeLocation) {
      setError("Please fill in all fields")
      return
    }

    // Mock authentication - in a real app, this would validate against a backend
    if (email.includes("@walmart.com")) {
      // Navigate to dashboard on successful login
      router.push("/manager-dashboard")
    } else {
      setError("Please use a valid Walmart manager email address (@walmart.com)")
    }
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle>Manager Login</CardTitle>
          <CardDescription>Sign in to access the quiet time request dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="manager@walmart.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-location">Store Location</Label>
              <Select value={storeLocation} onValueChange={setStoreLocation} required>
                <SelectTrigger id="store-location">
                  <SelectValue placeholder="Select your store location" />
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
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">For demo purposes, use any @walmart.com email</p>
        </CardFooter>
      </Card>
    </div>
  )
}
