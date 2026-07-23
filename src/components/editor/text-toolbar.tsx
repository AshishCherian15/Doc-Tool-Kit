"use client"

import { Button } from '@/components/ui/button'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Minus, Plus } from 'lucide-react'

interface TextToolbarProps {
  onBold: () => void
  onItalic: () => void
  onUnderline: () => void
  onAlignLeft: () => void
  onAlignCenter: () => void
  onAlignRight: () => void
  onFontSizeIncrease: () => void
  onFontSizeDecrease: () => void
  onChangeColor: (color: string) => void
}

export default function TextToolbar({
  onBold,
  onItalic,
  onUnderline,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onFontSizeIncrease,
  onFontSizeDecrease,
  onChangeColor,
}: TextToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg">
      <div className="flex gap-1 border-r pr-2">
        <Button size="icon" variant="ghost" onClick={onBold} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onItalic} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onUnderline} title="Underline">
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1 border-r pr-2">
        <Button size="icon" variant="ghost" onClick={onFontSizeDecrease} title="Decrease Font Size">
          <Minus className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onFontSizeIncrease} title="Increase Font Size">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1 border-r pr-2">
        <Button size="icon" variant="ghost" onClick={onAlignLeft} title="Align Left">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onAlignCenter} title="Align Center">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onAlignRight} title="Align Right">
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium">Color:</label>
        <input
          type="color"
          defaultValue="#000000"
          onChange={(e) => onChangeColor(e.target.value)}
          className="w-10 h-8 rounded border cursor-pointer"
          title="Text Color"
        />
      </div>
    </div>
  )
}
