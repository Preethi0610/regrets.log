'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ReactionPicker from './components/ReactionPicker'
import Link from 'next/link'
import ShareCard from './components/ShareCard'
import { Share2 } from 'lucide-react'

type Regret = {
  id: string
  user_id: string
  category: string
  title: string
  body: string
  alternative: string | null
  upvotes: number
  created_at: string
}

const CATEGORIES = ['all', 'career', 'relationship', 'money', 'health', 'other']

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [regrets, setRegrets] = useState<Regret[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'recent' | 'top'>('recent')
  const [loading, setLoading] = useState(true)
  const [shareRegret, setShareRegret] = useState<Regret | null>(null)

  useEffect(() => {
    checkUser()
    fetchRegrets()
  }, [activeCategory, sortBy])

  function timeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    return `${months}mo ago`
  }

  function alienTag(userId: string) {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
    }
    const num = 1000 + (hash % 9000)
    return `Alien #${num}`
  }

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data: userRow } = await supabase
        .from('users')
        .select('avatar')
        .eq('id', user.id)
        .single()

      setAvatar(userRow?.avatar ?? null)
    }
  }

  async function fetchRegrets() {
    setLoading(true)

    let query = supabase.from('regrets').select('*')

    if (activeCategory !== 'all') {
      query = query.eq('category', activeCategory)
    }

    if (sortBy === 'top') {
      query = query.order('upvotes', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error(error)
    } else {
      setRegrets(data)
    }

    setLoading(false)
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` }
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-950 via-violet-900 to-violet-950 text-white">
      <div className="mx-auto max-w-2xl px-4 py-10">

        <div className="mb-8 flex items-center justify-between">
          <div className="group relative inline-block px-6 py-4">
            {/* top row */}
            <div className="absolute top-0 left-4 right-4 flex justify-between">
              {Array.from({ length: 9 }).map((_, i) => (
                <span
                  key={`top-${i}`}
                  style={{ animation: `twinkle 1.6s ease-in-out ${i * 0.14}s infinite` }}
                  className="h-2 w-2 rounded-full bg-yellow-200 shadow-[0_0_6px_2px_rgba(253,224,71,0.7)]"
                />
              ))}
            </div>

            {/* bottom row */}
            <div className="absolute bottom-0 left-4 right-4 flex justify-between">
              {Array.from({ length: 9 }).map((_, i) => (
                <span
                  key={`bottom-${i}`}
                  style={{ animation: `twinkle 1.6s ease-in-out ${i * 0.14 + 0.3}s infinite` }}
                  className="h-2 w-2 rounded-full bg-yellow-200 shadow-[0_0_6px_2px_rgba(253,224,71,0.7)]"
                />
              ))}
            </div>

            {/* left column */}
            <div className="absolute top-4 bottom-4 left-0 flex flex-col justify-between">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={`left-${i}`}
                  style={{ animation: `twinkle 1.6s ease-in-out ${i * 0.25 + 0.15}s infinite` }}
                  className="h-2 w-2 rounded-full bg-yellow-200 shadow-[0_0_6px_2px_rgba(253,224,71,0.7)]"
                />
              ))}
            </div>

            {/* right column */}
            <div className="absolute top-4 bottom-4 right-0 flex flex-col justify-between">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={`right-${i}`}
                  style={{ animation: `twinkle 1.6s ease-in-out ${i * 0.25 + 0.45}s infinite` }}
                  className="h-2 w-2 rounded-full bg-yellow-200 shadow-[0_0_6px_2px_rgba(253,224,71,0.7)]"
                />
              ))}
            </div>

            <h1 className="relative text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-pink-200">
              Regret.log
            </h1>
          </div>


          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/post"
                className="rounded-full bg-white px-4 py-2 text-sm text-violet-900 hover:bg-violet-100"
              >
                + Post
              </Link>
              <Link
                href="/dashboard"
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-violet-700 text-lg hover:bg-violet-600"
              >
                {avatar ? (
                  <img src={avatarUrl(avatar)} alt="avatar" className="h-full w-full" />
                ) : (
                  '👤'
                )}
              </Link>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="rounded-full bg-white px-4 py-2 text-sm text-violet-900 hover:bg-violet-100"
            >
              Sign in with Google
            </button>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1 text-sm capitalize ${activeCategory === cat
                ? 'bg-white text-violet-900'
                : 'bg-violet-800 text-violet-100 hover:bg-violet-700'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`text-sm ${sortBy === 'recent' ? 'font-bold underline' : 'text-violet-300'}`}
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy('top')}
            className={`text-sm ${sortBy === 'top' ? 'font-bold underline' : 'text-violet-300'}`}
          >
            Top
          </button>
        </div>

        {loading ? (
          <p className="text-violet-300">Loading...</p>
        ) : regrets.length === 0 ? (
          <p className="text-violet-300">No regrets here yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {regrets.map((regret) => (
              <div
                key={regret.id}
                className="relative rounded-2xl bg-violet-800/50 p-4 backdrop-blur"
              >
                <span className="mb-2 inline-block rounded-full bg-violet-700 px-2 py-0.5 text-xs uppercase tracking-wide text-violet-200">
                  {regret.category}
                </span>
                <p className="mb-1 text-xs text-violet-400">
                  {alienTag(regret.user_id)} · {timeAgo(regret.created_at)}
                </p>
                <h2 className="text-lg font-semibold">{regret.title}</h2>
                <p className="mt-1 text-violet-100">{regret.body}</p>
                {regret.alternative && (
                  <p className="mt-2 text-sm italic text-violet-300">
                    Would do instead: {regret.alternative}
                  </p>
                )}
                <div className="mt-3">
                  <ReactionPicker regretId={regret.id} />
                  <button
                    onClick={() => setShareRegret(regret)}
                    className="absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 to-pink-200 shadow-[0_0_10px_3px_rgba(216,180,254,0.5)] transition-transform hover:scale-110"> 
                    <Share2 className="h-4 w-4 text-violet-900" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {shareRegret && (
        <ShareCard
          title={shareRegret.title}
          body={shareRegret.body}
          category={shareRegret.category}
          onClose={() => setShareRegret(null)}
        />
      )}
    </main>
  )
}