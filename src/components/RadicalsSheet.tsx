import { createContext, useContext, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { RadicalsContent } from './RadicalsContent'

const RadicalsOpenContext = createContext<() => void>(() => {})
export const useOpenRadicals = () => useContext(RadicalsOpenContext)
export const RadicalsProvider = RadicalsOpenContext.Provider

interface Props {
  open: boolean
  onClose: () => void
}

export function RadicalsSheet({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="字根表"
        className={cn(
          'fixed right-0 top-0 z-50 h-screen w-[640px] max-w-[90vw] bg-background border-l shadow-xl flex flex-col transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-lg">字根速查</h2>
            <kbd className="text-xs px-1.5 py-0.5 rounded border bg-muted text-muted-foreground">?</kbd>
          </div>
          <button
            onClick={onClose}
            aria-label="關閉字根表"
            className="rounded-md w-8 h-8 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <RadicalsContent />
        </div>
      </aside>
    </>
  )
}
