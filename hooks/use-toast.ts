"use client"

import * as React from "react"

import type { ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToastsMap = Map<string, ToastProps>

type State = {
  toasts: ToastProps[]
}

type Action =
  | {
      type: "ADD_TOAST"
      toast: ToastProps
    }
  | {
      type: "UPDATE_TOAST"
      toast: ToastProps
    }
  | {
      type: "DISMISS_TOAST"
      toastId?: string
    }
  | {
      type: "REMOVE_TOAST"
      toastId?: string
    }

interface Toast extends ToastProps {
  id: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ToastContext {
  toast: (props: ToastProps) => {
    id: string
    dismiss: () => void
    update: (props: ToastProps) => void
  }
  dismiss: (toastId?: string) => void
  toasts: Toast[]
}

const listeners: ((state: State) => void)[] = []

const toastTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map()

let state: State = {
  toasts: [],
}

function updateState(data: State) {
  state = data
  listeners.forEach((listener) => listener(state))
}

function dismissToast(toastId?: string) {
  updateState({
    ...state,
    toasts: state.toasts.map((toast) => (toast.id === toastId ? { ...toast, open: false } : toast)),
  })
}

function createToast(
  props: ToastProps & {
    id: string
    open: boolean
    onOpenChange: (open: boolean) => void
  },
) {
  const { id, duration = TOAST_REMOVE_DELAY } = props
  if (duration) {
    clearTimeout(toastTimeouts.get(id))
    const timeout = setTimeout(() => dismissToast(id), duration)
    toastTimeouts.set(id, timeout)
  }
  return props
}

const reducer = (state: State, action: Action): State => {
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
      const { toastId } = action
      if (toastId) {
        dismissToast(toastId)
      } else {
        state.toasts.forEach((toast) => dismissToast(toast.id))
      }
      return {
        ...state,
        toasts: state.toasts.map((toast) => (toast.id === toastId ? { ...toast, open: false } : toast)),
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
    default:
      return state
  }
}

function dispatch(action: Action) {
  updateState(reducer(state, action))
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function toast({ ...props }: ToastProps) {
  const id = generateId()

  const update = (props: ToastProps) => dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: createToast({
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
      ...props,
    }),
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [toasts, setToasts] = React.useState(state.toasts)

  React.useEffect(() => {
    listeners.push(setToasts)
    return () => {
      const index = listeners.indexOf(setToasts)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [toasts])

  return {
    ...state,
    toast,
    dismiss: React.useCallback((toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }), []),
  }
}

export { toast, useToast }
