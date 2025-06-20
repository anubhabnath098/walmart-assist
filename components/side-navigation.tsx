"use client"

import Link from "next/link"
import { Home, Eye, Ear, Brain, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface SideNavigationProps {
  currentPath: string
}

export default function SideNavigation({ currentPath }: SideNavigationProps) {
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/visually-impaired", label: "Visually Impaired", icon: Eye },
    { href: "/hearing-impaired", label: "Hearing Impaired", icon: Ear },
    { href: "/neurodivergent", label: "Neurodivergent", icon: Brain },
    { href: "/manager-login", label: "Manager Login", icon: User },
  ]

  return (
    <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 border-r bg-background flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Walmart Assist</h1>
        <p className="text-sm text-muted-foreground">Empowering Inclusive Shopping</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.href
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-6 border-t">
        <p className="text-xs text-muted-foreground">© 2025 Walmart Assist</p>
      </div>
    </div>
  )
}
