"use client"

import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export default function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    checkMobile() // Check on mount
    window.addEventListener("resize", checkMobile) // Add event listener for resize

    return () => {
      window.removeEventListener("resize", checkMobile) // Clean up on unmount
    }
  }, [])

  return { isMobile: false } // Always return false for now
}
