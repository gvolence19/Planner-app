import { cn } from "@/lib/utils"

interface AnimatedGradientTextProps {
  text: string
  className?: string
}

export default function AnimatedGradientText({ 
  text, 
  className 
}: AnimatedGradientTextProps) {
  return (
    <span 
      className={cn(
        "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent font-bold",
        className
      )}
    >
      {text}
    </span>
  )
}