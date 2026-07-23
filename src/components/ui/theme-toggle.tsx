"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-9 w-9 rounded-full border bg-muted/50 hover:bg-muted"
      title="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-500 transition-all" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 transition-all" />
      )}
    </Button>
  )
}
