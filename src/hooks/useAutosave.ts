import { useRef } from 'react'

export function useAutosave(documentId: string) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const loadAutosave = async () => {
    try {
      const res = await fetch(`/api/autosave?documentId=${documentId}`)
      if (!res.ok) return null
      const data = await res.json()
      // API returns the sessionData object directly (or null)
      if (data && (data.textNodes || data.whiteoutBlocks || data.highlights)) {
        return data
      }
      // Legacy: wrapped in sessionData string
      if (data?.sessionData) {
        return typeof data.sessionData === 'string' ? JSON.parse(data.sessionData) : data.sessionData
      }
    } catch (error) {
      console.error('Load autosave failed:', error)
    }
    return null
  }

  const saveAutosave = async (payload: { documentId: string; sessionData: object }) => {
    const res = await fetch('/api/autosave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Autosave failed: ${res.status}`)
    return res.json()
  }

  return { loadAutosave, saveAutosave }
}
