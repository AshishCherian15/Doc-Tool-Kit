import { create } from 'zustand'
import { EditorState, DocumentCanvasObject, DocumentAnnotation } from '@/types'

interface DocumentEditorStore extends EditorState {
  setDocumentId: (id: string) => void
  setPageNumber: (page: number) => void
  setZoom: (zoom: number) => void
  addObject: (obj: DocumentCanvasObject) => void
  updateObject: (index: number, obj: DocumentCanvasObject) => void
  removeObject: (index: number) => void
  setObjects: (objects: DocumentCanvasObject[]) => void
  addAnnotation: (annotation: DocumentAnnotation) => void
  removeAnnotation: (id: string) => void
  setAnnotations: (annotations: DocumentAnnotation[]) => void
  reset: () => void
}

export const useDocumentEditorStore = create<DocumentEditorStore>((set) => ({
  documentId: '',
  pageNumber: 1,
  zoom: 1,
  objects: [],
  annotations: [],
  setDocumentId: (id) => set({ documentId: id }),
  setPageNumber: (page) => set({ pageNumber: page }),
  setZoom: (zoom) => set({ zoom }),
  addObject: (obj) => set((state) => ({ objects: [...state.objects, obj] })),
  updateObject: (index, obj) => set((state) => {
    const objects = [...state.objects]
    objects[index] = obj
    return { objects }
  }),
  removeObject: (index) => set((state) => ({
    objects: state.objects.filter((_, i) => i !== index)
  })),
  setObjects: (objects) => set({ objects }),
  addAnnotation: (annotation) => set((state) => ({
    annotations: [...state.annotations, annotation]
  })),
  removeAnnotation: (id) => set((state) => ({
    annotations: state.annotations.filter(a => a.id !== id)
  })),
  setAnnotations: (annotations) => set({ annotations }),
  reset: () => set({
    documentId: '',
    pageNumber: 1,
    zoom: 1,
    objects: [],
    annotations: []
  })
}))

interface DocumentHistoryState {
  history: string[]
  currentIndex: number
  addToHistory: (state: string) => void
  undo: () => string | null
  redo: () => string | null
  canUndo: () => boolean
  canRedo: () => boolean
  clear: () => void
}

export const useDocumentHistoryStore = create<DocumentHistoryState>((set, get) => ({
  history: [],
  currentIndex: -1,
  addToHistory: (state) => set((prev) => {
    const newHistory = prev.history.slice(0, prev.currentIndex + 1)
    newHistory.push(state)
    if (newHistory.length > 50) newHistory.shift()
    return {
      history: newHistory,
      currentIndex: newHistory.length - 1
    }
  }),
  undo: () => {
    const { history, currentIndex } = get()
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 })
      return history[currentIndex - 1]
    }
    return null
  },
  redo: () => {
    const { history, currentIndex } = get()
    if (currentIndex < history.length - 1) {
      set({ currentIndex: currentIndex + 1 })
      return history[currentIndex + 1]
    }
    return null
  },
  canUndo: () => get().currentIndex > 0,
  canRedo: () => get().currentIndex < get().history.length - 1,
  clear: () => set({ history: [], currentIndex: -1 })
}))
