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
      if (!user) {
        setStatus({ isActive: false, plan: null, loading: false })
        return
      }

      const { data } = await supabase
        .from('subscriptions')
        .select('status, plan')
        .eq('user_id', user.id)
        .single()

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
