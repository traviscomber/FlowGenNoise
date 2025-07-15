"use client"

import type React from "react"

import { type Dispatch, createContext, useContext, useReducer } from "react"

type Toast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  cancel?: {
    label: string
    onClick?: () => void
  }
  duration?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export type ToastProps = Toast

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 1000000

type ActionType = "ADD_TOAST" | "UPDATE_TOAST" | "DISMISS_TOAST" | "REMOVE_TOAST"

type Action = {
  type: ActionType
  toast: Toast
} & {
  toastId?: string
}

interface State {
  toasts: Toast[]
}

const toastReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case "DISMISS_TOAST":
      if (action.toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) => (t.id === action.toastId ? { ...t, open: false } : t)),
        }
      }
      return {
        ...state,
        toasts: state.toasts.map((t) => ({ ...t, open: false })),
      }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const ToastsContext = createContext<{
  state: State
  dispatch: Dispatch<Action>
}>({
  state: { toasts: [] },
  dispatch: () => null,
})

type ToastProviderProps = {
  children: React.ReactNode
}

function ToastsProvider({ children }: ToastProviderProps) {
  const [state, dispatch] = useReducer(toastReducer, {
    toasts: [],
  })

  return <ToastsContext.Provider value={{ state, dispatch }}>{children}</ToastsContext.Provider>
}

function useToast() {
  const context = useContext(ToastsContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastsProvider")
  }

  return context
}

/* ---------- Imperative toast helpers ---------- */

type ToastInput = Omit<ToastProps, "id">

/**
 * Show a toast imperatively (outside React).
 *
 * \`\`\`ts
 * toast({ title: "Hello", description: "World" })
 * \`\`\`
 */
function toast(props: ToastInput) {
  const id = `toast-${Math.random().toString(36).substring(2, 9)}`

  const { dispatch } = useToast()

  const update = (toastProps: ToastProps) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...toastProps, id },
    })

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return { id, dismiss, update }
}

/**
 * Dismiss one (or all) toasts imperatively.
 */
function dismiss(toastId?: string) {
  const { dispatch } = useToast()
  dispatch({ type: "DISMISS_TOAST", toastId })
}
/* ---------- end helpers ---------- */

export { useToast, ToastsProvider, toast, dismiss }

// Re-export the toast helpers for UI components.
// Imports from "@/components/ui/use-toast" will now resolve.
export { useToast, toast } from "@/hooks/use-toast"
