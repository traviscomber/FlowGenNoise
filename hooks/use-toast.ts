"use client"

import { toast as sonnerToast, type ToastT } from "sonner"

/**
 * Global toast store & hook.
 * This implementation lets any component create/update/dismiss a toast
 * without pulling an external dependency.
 */

import * as React from "react"

import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

/* --- Config ------------------------------------------------------------- */
const TOAST_LIMIT = 5
const AUTO_REMOVE_DELAY = 7_000 // ms

/* --- Types -------------------------------------------------------------- */
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const ACTION = {
  ADD: "ADD_TOAST",
  UPDATE: "UPDATE_TOAST",
  DISMISS: "DISMISS_TOAST",
  REMOVE: "REMOVE_TOAST",
} as const

type Action =
  | { type: typeof ACTION.ADD; toast: ToasterToast }
  | { type: typeof ACTION.UPDATE; toast: Partial<ToasterToast> }
  | { type: typeof ACTION.DISMISS; toastId?: string }
  | { type: typeof ACTION.REMOVE; toastId?: string }

interface State {
  toasts: ToasterToast[]
}

/* --- Internal helpers --------------------------------------------------- */
const timeouts = new Map<string, ReturnType<typeof setTimeout>>()

function scheduleRemoval(id: string) {
  if (timeouts.has(id)) return
  const timeout = setTimeout(() => dispatch({ type: ACTION.REMOVE, toastId: id }), AUTO_REMOVE_DELAY)
  timeouts.set(id, timeout)
}

/* --- Reducer ------------------------------------------------------------ */
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ACTION.ADD:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }
    case ACTION.UPDATE:
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }
    case ACTION.DISMISS: {
      const { toastId } = action
      if (toastId) scheduleRemoval(toastId)
      else state.toasts.forEach((t) => scheduleRemoval(t.id))

      return {
        ...state,
        toasts: state.toasts.map((t) => (toastId === undefined || t.id === toastId ? { ...t, open: false } : t)),
      }
    }
    case ACTION.REMOVE:
      return {
        ...state,
        toasts: action.toastId ? state.toasts.filter((t) => t.id !== action.toastId) : [],
      }
    default:
      return state
  }
}

/* --- Global store ------------------------------------------------------- */
let store: State = { toasts: [] }
const listeners = new Set<(state: State) => void>()

function dispatch(action: Action) {
  store = reducer(store, action)
  listeners.forEach((fn) => fn(store))
}

/* --- Public API --------------------------------------------------------- */
let idCounter = 0
function genId() {
  idCounter = (idCounter + 1) % Number.MAX_SAFE_INTEGER
  return idCounter.toString()
}

type ToastInput = Omit<ToasterToast, "id">

export function toast({ ...props }: ToastInput) {
  const id = genId()

  const dismiss = () => dispatch({ type: ACTION.DISMISS, toastId: id })
  const update = (next: Partial<ToasterToast>) => dispatch({ type: ACTION.UPDATE, toast: { ...next, id } })

  dispatch({
    type: ACTION.ADD,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => !open && dismiss(),
    },
  })

  return { id, dismiss, update }
}

/**
 * Client hook to access toasts inside React components.
 */
export function useToast() {
  const [state, setState] = React.useState<State>(store)

  React.useEffect(() => {
    listeners.add(setState)
    return () => listeners.delete(setState)
  }, [])

  return {
    ...state,
    toast: (opts: ToastT) => sonnerToast(opts),
    dismiss: (id?: string) => dispatch({ type: ACTION.DISMISS, toastId: id }),
  }
}

// Re-export from the main implementation from "@/components/ui/use-toast"
