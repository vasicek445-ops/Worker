'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../app/supabase'

type SubStatus = {
  isActive: boolean
  plan: string | null
  loading: boolean
}

export function useSubscription() {
  const [status, setStatus] = useState<SubStatus>({
    isActive: false,
    plan: null,
    loading: true,
  })

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[useSubscription] user:', user?.id, user?.email)
      if (!user) {
        setStatus({ isActive: false, plan: null, loading: false })
        return
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, plan')
        .eq('user_id', user.id)
        .single()

      console.log('[useSubscription] sub data:', data, 'error:', error)

      setStatus({
        isActive: data?.status === 'active',
        plan: data?.plan || null,
        loading: false,
      })
    }
    check()
  }, [])

  return status
}
