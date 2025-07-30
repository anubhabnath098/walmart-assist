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
import { Loader2 } from "lucide-react"

export default function ManagerLoginClient() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [storeLocation, setStoreLocation] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (!email || !password || !storeLocation) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/manager/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          managerEmail: email,
          managerPassword: password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Save manager details to localStorage
      localStorage.setItem("managerDetails", JSON.stringify(data))

      // Navigate to dashboard on successful login
      router.push("/manager-dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login")
    } finally {
      setIsLoading(false)
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
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-location">Store Location</Label>
              <Select value={storeLocation} onValueChange={setStoreLocation} disabled={isLoading}>
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Authenticating..." : "Enter your manager credentials to continue"}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
