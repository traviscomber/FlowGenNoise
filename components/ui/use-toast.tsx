"use client"

/**
 * Re-export the toast helpers from hooks so that legacy imports like
 * `import { toast } from '@/components/ui/use-toast'` keep working.
 */
export { toast, useToast } from "@/hooks/use-toast"
