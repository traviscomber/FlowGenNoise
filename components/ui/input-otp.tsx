"use client"

import * as React from "react"
import { OTPInput, Slot, type OTPInputProps } from "input-otp"
import { Minus } from "lucide-react"

import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, OTPInputProps>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  ),
)
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />,
)
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot> & { index: number }
>(({ index, className, ...props }, ref) => (
  <Slot
    ref={ref}
    index={index}
    className={cn(
      "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
      "focus-within:z-10",
      {
        "border-l border-r-0": index === 0,
        "border-r border-l-0": index === props.maxLength - 1,
        "border-r-0": index !== props.maxLength - 1,
      },
      className,
    )}
    {...props}
  >
    {props.children}
  </Slot>
))
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("-mx-2 flex items-center", className)} {...props}>
      <Minus />
    </div>
  ),
)
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
