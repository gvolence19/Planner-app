import { cn } from "@/lib/utils"
import React from "react"

interface AnimatedGradientTextProps {
  text?: string
  className?: string
  children?: React.ReactNode
}

export default function AnimatedGradientText({ 
  text, 
  className,
  children 
}: AnimatedGradientTextProps) {
  return (
    <span 
      className={cn(
        "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent font-bold",
        className
      )}
    >
      {children || text}
    </span>
  )
}