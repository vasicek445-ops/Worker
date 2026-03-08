"use client"

import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function DebugSub() {
  const [info, setInfo] = useState<string>('Loading...')

  useEffect(() => {
    const check = async () => {
      const lines: string[] = []

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      lines.push(`User: ${user?.id || 'NULL'}`)
      lines.push(`Email: ${user?.email || 'NULL'}`)
      lines.push(`Auth error: ${userError?.message || 'none'}`)

      if (user) {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('status, plan')
          .eq('user_id', user.id)
          .single()

        lines.push(`Sub data: ${JSON.stringify(data)}`)
        lines.push(`Sub error: ${error?.message || 'none'}`)
        lines.push(`isActive: ${data?.status === 'active'}`)
      }

      setInfo(lines.join('\n'))
    }
    check()
  }, [])

  return (
    <pre style={{ color: '#fff', background: '#111', padding: 24, margin: 24, borderRadius: 12, fontSize: 14, whiteSpace: 'pre-wrap' }}>
      {info}
    </pre>
  )
}
