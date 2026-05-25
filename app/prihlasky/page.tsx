'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import {
  Mail, MailCheck, Calendar, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, MessageCircle, Clock, Sparkles, Send,
} from 'lucide-react'

type Classification = 'interview' | 'rejection' | 'question' | 'auto_reply' | 'positive' | 'neutral' | null

interface ReplyRow {
  id: string
  from_email: string
  from_name: string | null
  subject: string | null
  body_text: string | null
  classification: Classification
  classification_confidence: number | null
  classification_source?: 'ai' | 'user' | null
  low_confidence?: boolean
  ai_classification?: Classification
  received_at: string
}

interface SentApplication {
  id: number
  to_email: string
  subject: string | null
  body_preview: string | null
  sent_at: string
  reply_received_at: string | null
  reply_count: number
  reply_classification: Classification
  last_reply_preview: string | null
  replies?: ReplyRow[]
}

const CLASSIFICATION_META: Record<Exclude<Classification, null>, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
  interview: { label: 'Pohovor', color: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.25)', icon: CheckCircle2 },
  positive:  { label: 'Pozitivní', color: '#60a5fa', bg: 'rgba(96,165,250,0.10)', border: 'rgba(96,165,250,0.25)', icon: Sparkles },
  question:  { label: 'Dotaz HR', color: '#fb923c', bg: 'rgba(251,146,60,0.10)', border: 'rgba(251,146,60,0.25)', icon: MessageCircle },
  rejection: { label: 'Zamítnuto', color: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)', icon: XCircle },
  auto_reply:{ label: 'Auto-reply', color: '#a3a3a3', bg: 'rgba(163,163,163,0.10)', border: 'rgba(163,163,163,0.25)', icon: Mail },
  neutral:   { label: 'Odpověď', color: '#a3a3a3', bg: 'rgba(163,163,163,0.10)', border: 'rgba(163,163,163,0.25)', icon: Mail },
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (days === 0) return 'dnes'
  if (days === 1) return 'včera'
  if (days < 7) return `před ${days} dny`
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

async function reclassifyReply(replyId: string, classification: Exclude<Classification, null>): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return false
  const res = await fetch(`/api/replies/${replyId}/classify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ classification }),
  })
  return res.ok
}

export default function Prihlasky() {
  const [apps, setApps] = useState<SentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) {
        setLoading(false)
        return
      }

      const { data: sentRows } = await supabase
        .from('sent_applications')
        .select('id, to_email, subject, body_preview, sent_at, reply_received_at, reply_count, reply_classification, last_reply_preview')
        .eq('member_id', user.id)
        .order('sent_at', { ascending: false })

      if (cancelled) return
      const sent = (sentRows || []) as SentApplication[]

      if (sent.length > 0) {
        const appIds = sent.map((s) => s.id)
        const { data: replyRows } = await supabase
          .from('application_replies')
          .select('id, application_id, from_email, from_name, subject, body_text, classification, classification_confidence, classification_source, low_confidence, ai_classification, received_at')
          .in('application_id', appIds)
          .order('received_at', { ascending: false })

        if (cancelled) return
        const byApp: Record<number, ReplyRow[]> = {}
        for (const r of (replyRows || []) as (ReplyRow & { application_id: number })[]) {
          if (!byApp[r.application_id]) byApp[r.application_id] = []
          byApp[r.application_id].push(r)
        }
        for (const app of sent) {
          app.replies = byApp[app.id] || []
        }
      }

      setApps(sent)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  const totalSent = apps.length
  const totalReplies = apps.reduce((sum, a) => sum + (a.reply_count || 0), 0)
  const interviews = apps.filter((a) => a.reply_classification === 'interview').length

  return (
    <main
      className="min-h-screen bg-[#0a0a12] text-white px-4 sm:px-6 lg:px-8 py-6 lg:py-8"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}
    >
      <div className="max-w-5xl mx-auto space-y-5">

        <header>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight m-0">
            Moje přihlášky
          </h1>
          <p className="text-sm text-white/40 mt-1.5 m-0">
            Sleduj odeslané přihlášky a odpovědi od HR
          </p>
        </header>

        {totalSent > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <StatBox icon={Send} value={totalSent} label="odesláno" color="#fb923c" />
            <StatBox icon={MailCheck} value={totalReplies} label="odpovědí" color="#22c55e" />
            <StatBox icon={CheckCircle2} value={interviews} label="pohovorů" color="#60a5fa" />
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-12 text-center text-white/40">
            Načítám…
          </div>
        ) : apps.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {apps.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                expanded={expandedId === app.id}
                onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function StatBox({ icon: Icon, value, label, color }: { icon: typeof Send; value: number; label: string; color: string }) {
  return (
    <div className="rounded-xl bg-[#111120] border border-white/[0.06] p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
      </div>
      <div>
        <p className="text-white text-xl font-extrabold tabular-nums m-0 leading-tight">{value}</p>
        <p className="text-white/40 text-[11px] m-0 mt-0.5 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}

function ApplicationCard({ app, expanded, onToggle }: { app: SentApplication; expanded: boolean; onToggle: () => void }) {
  const meta = app.reply_classification ? CLASSIFICATION_META[app.reply_classification] : null
  const StatusIcon = meta?.icon ?? Clock
  const hasReplies = (app.replies?.length ?? 0) > 0

  return (
    <article className="rounded-2xl bg-[#111120] border border-white/[0.06] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 sm:p-5 hover:bg-white/[0.02] transition flex items-start gap-4"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: meta?.bg ?? 'rgba(255,255,255,0.04)',
            border: `1px solid ${meta?.border ?? 'rgba(255,255,255,0.06)'}`,
          }}
        >
          <StatusIcon className="w-4 h-4" style={{ color: meta?.color ?? 'rgba(255,255,255,0.4)' }} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="text-white text-[15px] font-bold m-0 truncate">
              {app.subject || '(bez předmětu)'}
            </h3>
            {meta && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap"
                style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
              >
                {meta.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[12px] text-white/50">
            <span className="truncate">{app.to_email}</span>
            <span className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
            <span className="flex items-center gap-1 flex-shrink-0">
              <Calendar className="w-3 h-3" strokeWidth={2} />
              {formatDate(app.sent_at)}
            </span>
          </div>

          {app.last_reply_preview && !expanded && (
            <p className="text-white/60 text-[13px] mt-3 m-0 line-clamp-2">
              {app.last_reply_preview}
            </p>
          )}
        </div>

        {hasReplies && (
          <div className="flex-shrink-0 self-center text-white/40">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        )}
      </button>

      {expanded && hasReplies && (
        <div className="border-t border-white/[0.06] px-5 py-4 space-y-5 bg-black/20">
          {app.replies!.map((r) => (
            <ReplyDetail key={r.id} reply={r} />
          ))}
        </div>
      )}
    </article>
  )
}

function ReplyDetail({ reply }: { reply: ReplyRow }) {
  const [classification, setClassification] = useState<Classification>(reply.classification)
  const [source, setSource] = useState<'ai' | 'user' | null>(reply.classification_source ?? 'ai')
  const [lowConfidence, setLowConfidence] = useState<boolean>(!!reply.low_confidence)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const meta = classification ? CLASSIFICATION_META[classification] : null
  const StatusIcon = meta?.icon ?? Mail
  const aiGuessLabel = reply.ai_classification && reply.ai_classification !== classification
    ? CLASSIFICATION_META[reply.ai_classification]?.label
    : null

  async function handlePick(c: Exclude<Classification, null>) {
    setSaving(true)
    const ok = await reclassifyReply(reply.id, c)
    if (ok) {
      setClassification(c)
      setSource('user')
      setLowConfidence(false)
      setPickerOpen(false)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-white text-sm font-bold m-0">
          {reply.from_name || reply.from_email}
        </p>
        <span className="text-white/40 text-[11px]">·</span>
        <span className="text-white/40 text-[11px]">{formatDate(reply.received_at)}</span>

        <div className="ml-auto flex items-center gap-2 relative">
          {lowConfidence && !pickerOpen && (
            <span className="text-[10px] text-amber-400/80 font-bold">Potvrď klasifikaci</span>
          )}
          <button
            type="button"
            onClick={() => setPickerOpen(!pickerOpen)}
            disabled={saving}
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 transition disabled:opacity-50 hover:opacity-80"
            style={{ background: meta?.bg ?? 'rgba(163,163,163,0.10)', color: meta?.color ?? '#a3a3a3', border: `1px solid ${meta?.border ?? 'rgba(163,163,163,0.25)'}` }}
          >
            <StatusIcon className="w-3 h-3" strokeWidth={2.5} />
            {meta?.label ?? 'Bez klasifikace'}
            <ChevronDown className="w-3 h-3 opacity-60" strokeWidth={2.5} />
          </button>

          {pickerOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1a28] border border-white/10 rounded-xl shadow-2xl z-10 py-1.5">
              {(Object.keys(CLASSIFICATION_META) as Exclude<Classification, null>[]).map((key) => {
                const m = CLASSIFICATION_META[key]
                const Icon = m.icon
                const active = key === classification
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePick(key)}
                    disabled={saving}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-white/[0.04] transition disabled:opacity-50 ${active ? 'bg-white/[0.03]' : ''}`}
                    style={{ color: m.color }}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                    <span className="font-bold">{m.label}</span>
                    {active && <span className="ml-auto text-[10px] opacity-60">✓</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Source hint — pokud AI uhadla jinak, ukaz */}
      {source === 'user' && aiGuessLabel && (
        <p className="text-[11px] text-white/40 italic m-0">
          AI odhadla: {aiGuessLabel} · ručně přepsáno
        </p>
      )}

      {reply.subject && (
        <p className="text-white/60 text-xs m-0 italic">{reply.subject}</p>
      )}
      <p className="text-white/80 text-[14px] m-0 whitespace-pre-wrap leading-relaxed">
        {reply.body_text || '(prázdné)'}
      </p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-[#111120] border border-white/[0.06] p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#fb923c]/10 border border-[#fb923c]/20 flex items-center justify-center mx-auto mb-4">
        <Send className="w-6 h-6 text-[#fb923c]" strokeWidth={2} />
      </div>
      <p className="text-white text-lg font-bold m-0 mb-2">Zatím žádné přihlášky</p>
      <p className="text-white/50 text-sm m-0 mb-5">
        Začni posílat přihlášky přes Smart Apply
      </p>
      <a
        href="/smart-apply"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#fb923c] text-black text-sm font-bold no-underline hover:bg-[#f97316] transition"
      >
        Otevřít Smart Apply →
      </a>
    </div>
  )
}
