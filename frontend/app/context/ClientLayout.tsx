"use client"

import { ReactNode } from "react"
import { SocketProvider } from "./SocketContext"
import { useAuth } from "./AuthContext"

export function ClientLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  return (
    <SocketProvider userId={user?.id}>
      {children}
    </SocketProvider>
  )
}
