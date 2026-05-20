'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../../app/supabase'
import type { ProfileRow } from './types'

export interface UseProfileResult {
  profile: ProfileRow | null
  userId: string | null
  loading: boolean
  reload: () => Promise<void>
  update: (patch: Partial<ProfileRow>) => Promise<void>
  saving: boolean
  savedAt: number | null      // timestamp posledniho uspesneho save
  saveError: string | null    // null = OK, string = chyba posledniho save
}

// Spolecny hook pro nacitani a auto-save profilu (debounce 400ms).
// Opravy oproti stare verzi:
// 1. pendingPatch se nesmaze pred ulozenim — kdyz userId neni ready,
//    flush se preplanuje (drive se patch ztracel).
// 2. userId precteme pres ref, ne stale closure.
// 3. profile.email defaultne na auth.user.email pokud v DB chybi
//    (SSOT pro kontaktni email napric apkou).
// 4. saveError surface chyby supabase (rls, network, etc).
export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const userIdRef = useRef<string | null>(null)
  const pendingPatch = useRef<Partial<ProfileRow>>({})
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inflight = useRef<boolean>(false)

  useEffect(() => { userIdRef.current = userId }, [userId])

  const flushNow = useCallback(async (): Promise<boolean> => {
    const uid = userIdRef.current
    if (!uid) {
      // Patch zachovavame, preplanujem.
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => { void flushNow() }, 400)
      return false
    }
    const patch = pendingPatch.current
    if (Object.keys(patch).length === 0) return true
    if (inflight.current) {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => { void flushNow() }, 250)
      return false
    }

    inflight.current = true
    setSaving(true)
    setSaveError(null)
    try {
      // Snapshot patch k odeslani (dalsi keystroky mohou prijit behem requestu)
      const snapshot = { ...patch }
      const { error } = await supabase
        .from('profiles')
        .update({ ...snapshot, updated_at: new Date().toISOString() })
        .eq('id', uid)

      if (error) {
        setSaveError(error.message || 'Uložení selhalo')
        return false
      }

      // Odeber pouze klice, ktere jsme prave ulozili. Nove zmeny zachovat.
      const remaining: Partial<ProfileRow> = { ...pendingPatch.current }
      for (const k of Object.keys(snapshot) as Array<keyof ProfileRow>) {
        if (remaining[k] === snapshot[k]) delete remaining[k]
      }
      pendingPatch.current = remaining
      setSavedAt(Date.now())

      if (Object.keys(remaining).length > 0) {
        // dalsi zmeny prisly behem inflight — flushni hned
        if (saveTimer.current) clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => { void flushNow() }, 100)
      }
      return true
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Uložení selhalo')
      return false
    } finally {
      inflight.current = false
      setSaving(false)
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { setLoading(false); return }
    setUserId(session.user.id)
    userIdRef.current = session.user.id

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()

    const loaded: ProfileRow = (data || { id: session.user.id }) as ProfileRow
    // SSOT: pokud profile.email chybi, defaultni na auth.user.email
    if (!loaded.email && session.user.email) {
      loaded.email = session.user.email
    }
    setProfile(loaded)
    setLoading(false)

    // Pokud user pisal pred nactenim userId, flushni ted.
    if (Object.keys(pendingPatch.current).length > 0) {
      void flushNow()
    }
  }, [flushNow])

  const update = useCallback(async (patch: Partial<ProfileRow>) => {
    setProfile((p) => ({ ...(p || { id: userIdRef.current || '' }), ...patch }) as ProfileRow)
    pendingPatch.current = { ...pendingPatch.current, ...patch }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => { void flushNow() }, 400)
  }, [flushNow])

  useEffect(() => { void load() }, [load])

  useEffect(() => {
    const handler = () => {
      if (Object.keys(pendingPatch.current).length > 0) void flushNow()
    }
    window.addEventListener('beforeunload', handler)
    document.addEventListener('visibilitychange', handler)
    return () => {
      window.removeEventListener('beforeunload', handler)
      document.removeEventListener('visibilitychange', handler)
    }
  }, [flushNow])

  return { profile, userId, loading, reload: load, update, saving, savedAt, saveError }
}
