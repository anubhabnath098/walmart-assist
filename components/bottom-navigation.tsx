"use client"

import Link from "next/link"
import { Home, Eye, Ear, Brain, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavigationProps {
  currentPath: string
}

export default function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/visually-impaired", label: "Visual", icon: Eye },
    { href: "/hearing-impaired", label: "Hearing", icon: Ear },
    { href: "/neurodivergent", label: "Neuro", icon: Brain },
    { href: "/manager-login", label: "Manager", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentPath === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
