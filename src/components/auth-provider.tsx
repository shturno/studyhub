"use client"

import type React from "react"
import { AuthProvider as CustomAuthProvider } from "@/lib/auth-context"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <CustomAuthProvider>{children}</CustomAuthProvider>
}
