"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import clsx from "clsx"

export type AnimatedThemeTogglerProps = {
  className?: string
}

export function AnimatedThemeToggler({ className }: AnimatedThemeTogglerProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      aria-label="Toggle Theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={clsx(
        "group relative inline-flex h-10 w-10 items-center justify-center rounded-full",
        // Light: dark button with light icon; Dark: darker button with light icon for contrast
        "bg-black text-white dark:bg-zinc-900 dark:text-white",
        "transition-transform duration-300 hover:scale-105 active:scale-95",
        "shadow-sm ring-1 ring-black/20 dark:ring-white/15",
        className
      )}
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/0 to-white/10 dark:from-white/0 dark:to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="relative flex items-center justify-center">
        {mounted ? (
          <>
            <Sun className={clsx("h-5 w-5 transition-all duration-300", isDark ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0")} />
            <Moon className={clsx("absolute h-5 w-5 transition-all duration-300", isDark ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90")} />
          </>
        ) : (
          // SSR placeholder to avoid hydration mismatch; keeps layout stable
          <Sun className="h-5 w-5 opacity-0" aria-hidden />
        )}
      </span>
    </button>
  )
}
