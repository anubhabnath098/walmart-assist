"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import BottomNavigation from "@/components/bottom-navigation"
import SideNavigation from "@/components/side-navigation"
import { useMobile } from "@/hooks/use-mobile"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

function ClientNav() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const isMobile = useMobile()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <>{isMobile ? <BottomNavigation currentPath={pathname} /> : <SideNavigation currentPath={pathname} />}</>
}

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="walmart-assist-theme">
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 pb-16 md:pb-0 md:pl-64">{children}</main>
        <ClientNav />
      </div>
    </ThemeProvider>
  )
}
