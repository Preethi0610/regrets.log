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

export default function PostPage() {
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [alternative, setAlternative] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { data: { user } } = await supabase.auth.getUser()

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

      <div className="relative mx-auto max-w-md px-4 py-10">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-violet-300 hover:underline"
          style={{ animation: 'fadeInUp 0.5s ease-out both' }}
        >
          ← Back to feed
        </Link>

        <div
          className="mb-6 rounded-2xl border border-violet-700/50 bg-violet-900/40 p-4 backdrop-blur"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}
        >
          <p className="font-serif italic text-sm leading-relaxed text-violet-200">
            "I started Regret.log because I wanted a place to see the choices
            other people wish they'd made differently before I had to learn
            the same lessons the hard way. Every post here is anonymous.
            Write the thing you'd tell a friend."
          </p>
          <p className="mt-2 text-xs text-violet-400"> - Your anonymous friend </p>
        </div>

        <h1
          className="mb-6 text-3xl font-extrabold tracking-tight"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}
        >
          Write it down
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