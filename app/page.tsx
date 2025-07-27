"use client"

import { useState } from "react"
import FlowArtGenerator from "@/components/flow-art-generator"
import PasswordGate from "@/components/auth/password-gate"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticated={() => setIsAuthenticated(true)} />
  }

  return <FlowArtGenerator />
}
