'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ConfirmDialog from '../components/ConfirmDialog'

const AVATAR_SEEDS = [
  'Felix', 'Aneka', 'Milo', 'Zoe', 'Gizmo',
  'Nova', 'Pixel', 'Juno', 'Rex', 'Sable',
]

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`
}

type Regret = {
  id: string
  category: string
  title: string
  body: string
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [myRegrets, setMyRegrets] = useState<Regret[]>([])
  const [totalReactions, setTotalReactions] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }
    setUser(user)

    const { data: userRow } = await supabase
      .from('users')
      .select('avatar')
      .eq('id', user.id)
      .single()

    setAvatar(userRow?.avatar ?? null)

    const { data: regrets } = await supabase
      .from('regrets')
      .select('id, category, title, body, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setMyRegrets(regrets ?? [])

    if (regrets && regrets.length > 0) {
      const regretIds = regrets.map((r) => r.id)
      const { count } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .in('regret_id', regretIds)

      setTotalReactions(count ?? 0)
    }

    setLoading(false)
  }

  async function handlePickAvatar(seed: string) {
    if (!user) return
    setAvatar(seed)
    await supabase.from('users').update({ avatar: seed }).eq('id', user.id)
  }

  function askDelete(regretId: string) {
    setPendingDeleteId(regretId)
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return

    const { error } = await supabase.from('regrets').delete().eq('id', pendingDeleteId)

    if (error) {
      console.error(error)
    } else {
      setMyRegrets((prev) => prev.filter((r) => r.id !== pendingDeleteId))
    }

    setPendingDeleteId(null)
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-violet-950 text-white flex items-center justify-center">
        Loading...
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-violet-950 text-white flex items-center justify-center">
        Please sign in to view your dashboard.
      </main>
    )
  }

  const displayName = user.user_metadata?.full_name || user.email

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-950 via-violet-900 to-violet-950 text-white">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/" className="mb-4 inline-block text-sm text-violet-300 hover:underline">
          ← Back to feed
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-violet-700">
              {avatar ? (
                <img src={avatarUrl(avatar)} alt="avatar" className="h-full w-full" />
              ) : (
                <span className="text-3xl">🙂</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome, {displayName}</h1>
              <p className="text-violet-300 text-sm">
                {myRegrets.length} posts · {totalReactions} total reactions received
              </p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="rounded-full bg-violet-800 px-4 py-2 text-sm hover:bg-violet-700"
          >
            Sign out
          </button>
        </div>

        <div className="mb-10">
          <h2 className="mb-2 text-sm uppercase tracking-wide text-violet-300">
            Choose your avatar
          </h2>
          <div className="flex flex-wrap gap-3">
            {AVATAR_SEEDS.map((seed) => (
              <button
                key={seed}
                onClick={() => handlePickAvatar(seed)}
                className={`h-14 w-14 overflow-hidden rounded-full border-2 ${
                  avatar === seed ? 'border-white' : 'border-transparent hover:border-violet-400'
                }`}
              >
                <img src={avatarUrl(seed)} alt={seed} className="h-full w-full" />
              </button>
            ))}
          </div>
        </div>

        <h2 className="mb-3 text-sm uppercase tracking-wide text-violet-300">
          Your posts
        </h2>
        {myRegrets.length === 0 ? (
          <p className="text-violet-300">You haven't posted any regrets yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {myRegrets.map((regret) => (
              <div
                key={regret.id}
                className="rounded-xl bg-violet-800/50 p-4 flex justify-between items-start gap-4"
              >
                <div>
                  <span className="mb-1 inline-block rounded-full bg-violet-700 px-2 py-0.5 text-xs uppercase text-violet-200">
                    {regret.category}
                  </span>
                  <h3 className="font-semibold">{regret.title}</h3>
                  <p className="text-sm text-violet-200">{regret.body}</p>
                </div>
                <button
                  onClick={() => askDelete(regret.id)}
                  className="shrink-0 rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-300 hover:bg-red-500/30"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {pendingDeleteId && (
        <ConfirmDialog
          onConfirm={confirmDelete}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </main>
  )
}