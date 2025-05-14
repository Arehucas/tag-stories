"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { Check, X } from "lucide-react"

import { cn } from "@/lib/utils"

function Switch({
  className,
  checked,
  onCheckedChange,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "relative flex items-center w-14 h-8 rounded-full transition-colors duration-200 bg-gray-700 peer data-[state=checked]:bg-[#3a86ff] data-[state=unchecked]:bg-gray-700",
        className
      )}
      checked={checked}
      onCheckedChange={onCheckedChange}
      {...props}
    >
      {/* Icono check */}
      <span className={
        cn(
          "absolute left-2 top-1/2 transform -translate-y-1/2 transition-opacity duration-200",
          checked ? "opacity-100" : "opacity-0"
        )
      }>
        <Check width={18} height={18} stroke="#fff" />
      </span>
      {/* Icono cruz */}
      <span className={
        cn(
          "absolute right-2 top-1/2 transform -translate-y-1/2 transition-opacity duration-200",
          !checked ? "opacity-100" : "opacity-0"
        )
      }>
        <X width={18} height={18} stroke="#888" />
      </span>
      {/* Thumb */}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "absolute left-0 top-0 h-8 w-8 bg-white rounded-full shadow transition-transform duration-200 border border-gray-200",
          checked ? "translate-x-6" : "translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
