import { create } from 'zustand'

interface DiagnosticResult {
  id: string
  type: string
  data: {
    status?: string
    query?: string
    stage?: string
    diagnosis?: string
    suggestions?: string[]
  }
}

interface DiagnosticsStore {
  results: DiagnosticResult[]
  isStreaming: boolean
  addResult: (result: DiagnosticResult) => void
  clearResults: () => void
  setStreaming: (streaming: boolean) => void
}

export const useDiagnosticsStore = create<DiagnosticsStore>((set) => ({
  results: [],
  isStreaming: false,
  addResult: (result) => set((state) => ({ results: [...state.results, result] })),
  clearResults: () => set({ results: [] }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
}))
