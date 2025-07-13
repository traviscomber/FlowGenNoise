"use client"

// This is a placeholder for a useMobile hook.
// You can implement it using media queries or a library like 'react-responsive'.
import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768) // Example breakpoint for mobile
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
      handleResize() // Set initial value
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  return isMobile
}
