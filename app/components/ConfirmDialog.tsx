'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function ConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    const t = setTimeout(() => setVisible(true), 20)
    return () => clearTimeout(t)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`w-72 rounded-2xl border-2 border-rose-900/40 bg-gradient-to-b from-rose-100 to-rose-200 p-6 text-center shadow-2xl transition-all duration-300 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <p className="text-4xl">💔</p>
        <h2 className="mt-2 font-serif text-lg font-bold text-rose-950">
          Let it go for good?
        </h2>
        <p className="mt-1 text-sm text-rose-800">
          Gone forever. Kind of like your 20s.
        </p>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full bg-white px-3 py-2 text-sm font-medium text-rose-900 hover:bg-rose-50"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-full bg-rose-900 px-3 py-2 text-sm font-medium text-white hover:bg-rose-950"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}