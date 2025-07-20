"use client"

import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT) // Tailwind's 'md' breakpoint
    }

    const onChange = () => {
      checkMobile()
    }

    checkMobile() // Check on initial mount
    mql.addEventListener("change", onChange)
    window.addEventListener("resize", checkMobile) // Add event listener for resize

    return () => {
      mql.removeEventListener("change", onChange)
      window.removeEventListener("resize", checkMobile) // Clean up on unmount
    }
  }, [])

  return !!isMobile
}
