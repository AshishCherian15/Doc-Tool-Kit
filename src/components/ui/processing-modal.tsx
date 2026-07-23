"use client"

import { useEffect, useState } from "react"
import { Loader2, CheckCircle2, FileText, Sparkles } from "lucide-react"

interface ProcessingModalProps {
  isOpen: boolean
  title?: string
  statusMessage?: string
  progress?: number
  onComplete?: () => void
}

export function ProcessingModal({
  isOpen,
  title = "Processing PDF...",
  statusMessage = "Applying changes to your document...",
  progress,
  onComplete,
}: ProcessingModalProps) {
  const [internalProgress, setInternalProgress] = useState(0)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setInternalProgress(0)
      setIsDone(false)
      return
    }

    if (progress !== undefined) {
      setInternalProgress(progress)
      if (progress >= 100) {
        setIsDone(true)
      }
      return
    }

    // Auto simulate smooth progress if progress prop not provided
    setInternalProgress(15)
    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 92
        }
        return prev + Math.floor(Math.random() * 15) + 5
      })
    }, 250)

    return () => clearInterval(interval)
  }, [isOpen, progress])

  if (!isOpen) return null

  const displayProgress = progress !== undefined ? progress : internalProgress

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border border-border shadow-2xl rounded-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center text-center relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Dynamic Graphic Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
            <FileText className="h-10 w-10 text-white animate-bounce" />
          </div>
          {isDone ? (
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full shadow-md animate-in zoom-in">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          ) : (
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-md animate-spin">
              <Sparkles className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Title & Status */}
        <h3 className="text-xl font-bold tracking-tight mb-2">
          {isDone ? "Ready to Download!" : title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          {isDone ? "Your document has been processed successfully." : statusMessage}
        </p>

        {/* Progress Bar Container */}
        <div className="w-full bg-secondary/80 rounded-full h-3 mb-3 p-0.5 overflow-hidden border border-border">
          <div
            className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(displayProgress, 100)}%` }}
          />
        </div>

        {/* Percentage Indicator */}
        <div className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground px-1">
          <span>{isDone ? "Complete" : "Processing"}</span>
          <span>{Math.min(Math.round(displayProgress), 100)}%</span>
        </div>
      </div>
    </div>
  )
}
