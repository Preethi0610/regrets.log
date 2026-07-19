'use client'

import { useEffect, useState } from 'react'

export default function Toast({
  message,
  onClose,
  duration = 4000,
}: {
  message: string
  onClose: () => void
  duration?: number
}) {
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing'>('opening')

  useEffect(() => {
    const openTimer = setTimeout(() => setPhase('open'), 20)
    const closeTimer = setTimeout(() => setPhase('closing'), duration)
    return () => {
      clearTimeout(openTimer)
      clearTimeout(closeTimer)
    }
  }, [duration])

  useEffect(() => {
    if (phase === 'closing') {
      const removeTimer = setTimeout(onClose, 400)
      return () => clearTimeout(removeTimer)
    }
  }, [phase, onClose])

  const rotation = phase === 'open' ? 'rotateX(0deg) rotate(-2deg)' : 'rotateX(-100deg) rotate(-2deg)'
  const opacity = phase === 'open' ? 'opacity-100' : 'opacity-0'

  return (
    <div
      style={{ perspective: '900px' }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        style={{ transform: rotation, transformOrigin: 'top center' }}
        className={`transition-all duration-[400ms] ease-in-out ${opacity}`}
      >
        <div className="w-96 h-96 flex flex-col justify-center items-center bg-[#f4ecd8] border-2 border-stone-800 shadow-[6px_6px_0_rgba(0,0,0,0.3)] p-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-stone-500 mb-2">
            The Daily Regret
          </p>
          <div className="w-16 border-t border-stone-400 mb-4" />
          <h2 className="font-serif text-4xl font-black uppercase leading-tight text-stone-900">
            {message}
          </h2>
          <div className="w-16 border-t border-stone-400 mt-4" />
        </div>
      </div>
    </div>
  )
}