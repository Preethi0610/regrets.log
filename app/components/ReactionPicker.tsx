'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Toast from './Toast'

const EMOJI_OPTIONS = ['😔', '🙏', '🫂', '😂', '💡', '❤️', '😮', '👏']

type ReactionCount = {
  reaction_type: string
  count: number
}

export default function ReactionPicker({ regretId }: { regretId: string }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [counts, setCounts] = useState<ReactionCount[]>([])
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set())
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchCounts()
  }, [regretId])

  async function fetchCounts() {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('votes')
      .select('reaction_type, user_id')
      .eq('regret_id', regretId)

    if (error) {
      console.error(error)
      return
    }

    const grouped: Record<string, number> = {}
    const mine = new Set<string>()

    data.forEach((row) => {
      grouped[row.reaction_type] = (grouped[row.reaction_type] || 0) + 1
      if (user && row.user_id === user.id) {
        mine.add(row.reaction_type)
      }
    })

    const result = Object.entries(grouped).map(([reaction_type, count]) => ({
      reaction_type,
      count,
    }))

    setCounts(result)
    setMyReactions(mine)
  }

  async function handleReact(emoji: string) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setToastMessage('UNAUTHORIZED REGRETTING SIGN IN FIRST DUDE!!!')
      setPickerOpen(false)
      return
    }

    if (myReactions.has(emoji)) {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('regret_id', regretId)
        .eq('user_id', user.id)
        .eq('reaction_type', emoji)

      if (error) console.error(error)
    } else {
      const { error } = await supabase.from('votes').insert({
        regret_id: regretId,
        user_id: user.id,
        reaction_type: emoji,
      })

      if (error) console.error(error)
    }

    setPickerOpen(false)
    fetchCounts()
  }

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      {counts.map((c) => (
        <button
          key={c.reaction_type}
          onClick={() => handleReact(c.reaction_type)}
          className={`rounded-full px-2 py-1 text-sm ${
            myReactions.has(c.reaction_type)
              ? 'bg-violet-400 text-violet-950 font-semibold'
              : 'bg-violet-100 text-violet-800'
          }`}
        >
          {c.reaction_type} {c.count}
        </button>
      ))}

      <button
        onClick={() => setPickerOpen(!pickerOpen)}
        className="rounded-full bg-violet-200 px-3 py-1 text-sm text-violet-800 hover:bg-violet-300"
      >
        + React
      </button>

      {pickerOpen && (
        <div className="absolute bottom-full left-0 mb-2 flex gap-1 rounded-lg bg-white p-2 shadow-lg">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className={`rounded p-1 text-xl hover:bg-violet-100 ${
                myReactions.has(emoji) ? 'bg-violet-200' : ''
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  )
}