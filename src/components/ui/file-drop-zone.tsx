"use client"

import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileDropZoneProps {
  accept?: string
  disabled?: boolean
  label?: string
  hint?: string
  onFileSelect: (file: File) => void
  className?: string
}

export function FileDropZone({
  accept = 'application/pdf',
  disabled = false,
  label = 'Drop a file here or click to browse',
  hint = 'PDF files only',
  onFileSelect,
  className,
}: FileDropZoneProps) {
  const handleFiles = (files: FileList | null) => {
    const file = files?.[0]
    if (file) onFileSelect(file)
  }

  return (
    <label
      className={cn(
        'block cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-brand-blue/50 hover:bg-muted/40',
        className
      )}
      onDragOver={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (!disabled) handleFiles(event.dataTransfer.files)
      }}
    >
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
      <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </label>
  )
}
