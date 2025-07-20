"use client"

import * as React from "react"
import type * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import { Controller, type ControllerProps, type FieldPath, type FieldValues, useFormContext } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = useFormContext

type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerProps<TFieldValues, TName>

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FormFieldProps<TFieldValues, TName>,
) => {
  return (
    <Controller
      {...props}
      render={({ field, fieldState, formState }) => {
        return props.render({ field, fieldState, formState })
      }}
    />
  )
}

const FormItemContext = React.createContext<{ name: string } | null>(null)

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId()

    return (
      <FormItemContext.Provider value={{ name: id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    )
  },
)
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { name } = React.useContext(FormItemContext) ?? {}

  const { formState, control } = useFormContext()
  const fieldState = name ? formState.errors[name] : undefined

  return <Label ref={ref} className={cn(fieldState && "text-destructive", className)} htmlFor={name} {...props} />
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    const { name } = React.useContext(FormItemContext) ?? {}
    const { formState, control } = useFormContext()

    const fieldState = name ? formState.errors[name] : undefined

    return (
      <Slot
        ref={ref}
        id={name}
        aria-describedby={fieldState ? `${name}-form-item-message` : undefined}
        aria-invalid={!!fieldState}
        {...props}
      />
    )
  },
)
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { name } = React.useContext(FormItemContext) ?? {}
    const { formState, control } = useFormContext()

    if (!name) {
      return null
    }

    const fieldState = formState.errors[name]

    return (
      <p
        ref={ref}
        id={`${name}-form-item-description`}
        className={cn("text-[0.8rem] text-muted-foreground", className)}
        {...props}
      />
    )
  },
)
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { name } = React.useContext(FormItemContext) ?? {}
    const { formState, control } = useFormContext()

    if (!name) {
      return null
    }

    const fieldState = formState.errors[name]
    const body = fieldState?.message

    if (!body) {
      return null
    }

    return (
      <p
        ref={ref}
        id={`${name}-form-item-message`}
        className={cn("text-[0.8rem] font-medium text-destructive", className)}
        {...props}
      >
        {body as string}
      </p>
    )
  },
)
FormMessage.displayName = "FormMessage"

export { useFormContext as useForm, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage }
