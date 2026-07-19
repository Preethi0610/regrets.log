'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Toast from '../components/Toast'

const SCATTER_TAGS = [
  { text: 'career', top: '8%', left: '4%', rot: '-8deg', size: 'text-3xl' },
  { text: 'relationship', top: '18%', left: '78%', rot: '6deg', size: 'text-2xl' },
  { text: 'money', top: '68%', left: '6%', rot: '5deg', size: 'text-4xl' },
  { text: 'health', top: '80%', left: '72%', rot: '-5deg', size: 'text-2xl' },
  { text: 'what if...', top: '40%', left: '85%', rot: '-4deg', size: 'text-xl' },
  { text: 'should have', top: '55%', left: '2%', rot: '3deg', size: 'text-xl' },
  { text: 'other', top: '5%', left: '55%', rot: '4deg', size: 'text-2xl' },
]

function StringLights() {
  const points = [
    { x: 0, y: 14 }, { x: 100, y: 85 }, { x: 200, y: 14 },
    { x: 300, y: 85 }, { x: 400, y: 14 }, { x: 500, y: 85 },
    { x: 600, y: 14 }, { x: 700, y: 85 }, { x: 800, y: 14 },
  ]
  const wirePath =
    'M0,14 Q100,90 200,14 Q300,90 400,14 Q500,90 600,14 Q700,90 800,14'

  return (
    <div className="pointer-events-none absolute top-0 left-0 right-0 h-28 sm:h-44">
      <svg viewBox="0 0 800 100" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="warmHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path d={wirePath} fill="none" stroke="#2e2440" strokeWidth="2" opacity={0.7} />

        {points.map((p, i) => (
          <g
            key={i}
            style={{
              transformOrigin: `${p.x}px ${p.y}px`,
              animation: `twinkle 2.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          >
            {/* cord dropping from wire */}
            <line x1={p.x} y1={p.y - 8} x2={p.x} y2={p.y + 10} stroke="#1f1830" strokeWidth="2.5" />

            {/* dark socket housing */}
            <rect x={p.x - 5} y={p.y + 9} width="10" height="7" fill="#1f1830" rx="1.5" />

            {/* soft ambient glow halo, much larger than the bulb */}
            <circle cx={p.x} cy={p.y + 24} r="26" fill="url(#warmHalo)" />

            {/* glass bulb */}
            <ellipse cx={p.x} cy={p.y + 22} rx="8" ry="11" fill="#fcd34d" opacity="0.95" />

            {/* filament glow core */}
            <ellipse cx={p.x} cy={p.y + 22} rx="3.5" ry="6" fill="#fff7ed" opacity="0.9" />
          </g>
        ))}
      </svg>
    </div>
  )
}

export default function PostPage() {
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [alternative, setAlternative] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setToastMessage('Please sign in to post')
      return
    }

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const { count, error: countError } = await supabase
      .from('regrets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfToday.toISOString())

    console.log('COUNT:', count, 'ERROR:', countError)

    if (countError) {
      console.error(countError)
    }

    if (count !== null && count >= 3) {
      setToastMessage("That's 3 regrets today. Not judging, but that's a lot, bruh")
      return
    }

    const { error } = await supabase.from('regrets').insert({
      category,
      title,
      body,
      alternative,
      user_id: user?.id,
    })

    if (error) {
      console.error(error)
      setToastMessage('Something went wrong posting this')
    } else {
      setToastMessage('Your regret is now part of the record')
      setCategory('')
      setTitle('')
      setBody('')
      setAlternative('')
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-violet-950 via-violet-900 to-violet-950 text-white">

      <StringLights />

      <div className="pointer-events-none absolute inset-0">
        {SCATTER_TAGS.map((tag, i) => (
          <span
            key={tag.text}
            style={{
              top: tag.top,
              left: tag.left,
              // @ts-ignore
              '--rot': tag.rot,
              animation: `driftIn 0.8s ease-out ${i * 0.1}s both`,
            }}
            className={`absolute font-serif italic text-violet-400/20 ${tag.size} select-none`}
          >
            {tag.text}
          </span>
        ))}
      </div>

      <div className="relative mx-auto max-w-md px-4 pt-24 sm:pt-40 pb-10">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-violet-300 hover:underline"
          style={{ animation: 'fadeInUp 0.5s ease-out both' }}
        >
          ← Back to feed
        </Link>

        <div
          className="mb-6 rounded-2xl border border-white/20 bg-gradient-to-r from-violet-400/90 to-pink-300/90 p-4 shadow-lg"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}
        >
          <p className="font-serif italic text-sm leading-relaxed text-black-300 ">
            I started Regret.log because I wanted a place to see the choices
            other people wish they'd made differently before I had to learn
            the same lessons the hard way. Every post here is anonymous.
            Write the thing you'd tell a friend.
          </p>
          <p className="mt-2 text-xs text-black-400"> - Your anonymous friend </p>
        </div>

        <h1
          className="mb-6 text-3xl font-extrabold tracking-tight"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}
        >
         <span className="text-pink-300"> let it out.</span>
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-violet-700/50 bg-violet-900/60 p-5 backdrop-blur"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}
        >
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-violet-300">
              Category <span className="text-pink-300">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full rounded-lg border border-violet-600 bg-violet-950/60 p-2 text-sm text-white focus:border-violet-300 focus:outline-none"
            >
              <option value="">Select a category</option>
              <option value="career">Career</option>
              <option value="relationship">Relationship</option>
              <option value="money">Money</option>
              <option value="health">Health</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-violet-300">
              Title <span className="text-pink-300">*</span>
            </label>
            <input
              type="text"
              placeholder="In a sentence, what happened?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-violet-600 bg-violet-950/60 p-2 text-sm text-white placeholder-violet-500 focus:border-violet-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-violet-300">
              What happened? <span className="text-pink-300">*</span>
            </label>
            <textarea
              placeholder="Tell it like you'd tell a friend"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={4}
              className="w-full rounded-lg border border-violet-600 bg-violet-950/60 p-2 text-sm text-white placeholder-violet-500 focus:border-violet-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-violet-300">
              What would you do instead? <span className="text-violet-500">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="If you had another shot"
              value={alternative}
              onChange={(e) => setAlternative(e.target.value)}
              className="w-full rounded-lg border border-violet-600 bg-violet-950/60 p-2 text-sm text-white placeholder-violet-500 focus:border-violet-300 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-full bg-gradient-to-r from-violet-400 to-pink-300 px-4 py-2 text-sm font-semibold text-violet-950 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Post anonymously
          </button>
        </form>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </main>
  )
}