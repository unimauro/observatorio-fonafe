import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Dataset } from './types'

interface DataState {
  data: Dataset | null
  loading: boolean
  error: string | null
}

const DataContext = createContext<DataState>({ data: null, loading: true, error: null })

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>({ data: null, loading: true, error: null })

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    fetch(`${base}data/latest/dataset.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: Dataset) => setState({ data, loading: false, error: null }))
      .catch((e) => setState({ data: null, loading: false, error: String(e) }))
  }, [])

  return <DataContext.Provider value={state}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}
