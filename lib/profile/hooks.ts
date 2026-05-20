'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../app/supabase'
import type { ProfileRow } from './types'

export interface UseProfileResult {
  profile: ProfileRow | null
  userId: string | null
  loading: boolean
  reload: () => Promise<void>
  update: (patch: Partial<ProfileRow>) => Promise<void>
  saving: boolean
  savedAt: number | null    // timestamp posledního save
}

// Společný hook pro načítání a auto-save profilu.
// Debounce 400ms — Linear/Notion-style auto-save.
export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const pendingPatch = useRef<Partial<ProfileRow>>({})
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function load() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { setLoading(false); return }
    setUserId(session.user.id)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
    setProfile(data || { id: session.user.id })
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function flush() {
    const patch = pendingPatch.current
    pendingPatch.current = {}
    if (Object.keys(patch).length === 0) return
    if (!userId) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', userId)
    setSaving(false)
    if (!error) setSavedAt(Date.now())
  }

  async function update(patch: Partial<ProfileRow>) {
    // optimistic
    setProfile((p) => ({ ...(p || { id: userId! }), ...patch }) as ProfileRow)
    pendingPatch.current = { ...pendingPatch.current, ...patch }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => { flush() }, 400)
  }

  // Flush na odchod ze stránky
  useEffect(() => {
    const handler = () => { if (Object.keys(pendingPatch.current).length > 0) flush() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return { profile, userId, loading, reload: load, update, saving, savedAt }
}
