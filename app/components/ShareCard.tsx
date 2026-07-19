'use client'

import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'


export default function ShareCard({
  title,
  body,
  category,
  onClose,
}: {
  title: string
  body: string
  category: string
  onClose: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => setMounted(true), [])

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.origin)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 600
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#f4ecd8'
    ctx.fillRect(0, 0, 600, 600)
    ctx.strokeStyle = '#1c1917'
    ctx.lineWidth = 4
    ctx.strokeRect(10, 10, 580, 580)

    ctx.fillStyle = '#78716c'
    ctx.font = '14px Georgia'
    ctx.textAlign = 'center'
    ctx.fillText('THE DAILY REGRET', 300, 90)
    ctx.fillText(category.toUpperCase(), 300, 120)

    ctx.fillStyle = '#1c1917'
    ctx.font = 'bold 28px Georgia'
    wrapText(ctx, title, 300, 200, 480, 36)

    ctx.font = 'italic 16px Georgia'
    ctx.fillStyle = '#44403c'
    wrapText(ctx, body, 300, 320, 460, 26)

    ctx.font = '12px Georgia'
    ctx.fillStyle = '#a8a29e'
    ctx.fillText('regret.log', 300, 560)

    const link = document.createElement('a')
    link.download = 'regret.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(' ')
    let line = ''
    let curY = y
    for (const word of words) {
      const testLine = line + word + ' '
      if (ctx.measureText(testLine).width > maxWidth && line !== '') {
        ctx.fillText(line, x, curY)
        line = word + ' '
        curY += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, curY)
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-violet-950 p-5 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-violet-900 shadow-lg hover:bg-violet-100"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          ref={cardRef}
          className="mb-4 rounded-xl border-2 border-stone-800 bg-[#f4ecd8] p-5 text-center"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-stone-500">
            The Daily Regret
          </p>
          <p className="mt-1 text-xs uppercase text-stone-500">{category}</p>
          <h2 className="mt-3 font-serif text-xl font-black uppercase leading-snug text-stone-900">
            {title}
          </h2>
          <p className="mt-3 font-serif italic text-sm text-stone-700">{body}</p>
          <p className="mt-4 text-[10px] text-stone-400">regret.log</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 rounded-full bg-violet-800 px-3 py-2 text-sm text-white hover:bg-violet-700"
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 rounded-full bg-white px-3 py-2 text-sm text-violet-900 hover:bg-violet-100"
          >
            Download
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}