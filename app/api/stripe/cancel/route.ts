import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Zruší předplatné ke konci aktuálního období + uloží feedback z dotazníku.
export async function POST(req: NextRequest) {
  try {
    const { userId, reason, comment } = await req.json()

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })
    }
    if (!reason || typeof reason !== 'string') {
      return NextResponse.json({ error: 'Vyber prosím důvod' }, { status: 400 })
    }

    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', userId)
      .single()

    if (!sub?.stripe_subscription_id) {
      return NextResponse.json({ error: 'Žádné aktivní předplatné' }, { status: 400 })
    }

    // Feedback uložit PŘED zrušením — když migrace neproběhla, neproběhne cancel.
    const { error: insertErr } = await supabaseAdmin.from('cancellation_feedback').insert({
      user_id: userId,
      reason,
      comment: (comment && typeof comment === 'string') ? comment.slice(0, 2000) : null,
      stripe_subscription_id: sub.stripe_subscription_id,
    })
    if (insertErr) {
      console.error('Feedback insert error:', insertErr)
      return NextResponse.json({ error: 'Nepodařilo se uložit feedback. Zkus to za chvíli.' }, { status: 500 })
    }

    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    if (process.env.RESEND_API_KEY) {
      try {
        const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(userId)
        const userEmail = userRes?.user?.email || '(neznámý e-mail)'
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Woker <noreply@woker.ch>',
            to: 'realhasta369@gmail.com',
            subject: `[Woker] Zrušení předplatného — ${reason}`,
            text: `Uživatel: ${userEmail}\nUser ID: ${userId}\nDůvod: ${reason}\nKomentář: ${comment || '(žádný)'}`,
          }),
        })
      } catch (e) {
        console.error('Resend notify failed:', e)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Cancel error:', error)
    return NextResponse.json({ error: 'Chyba při rušení' }, { status: 500 })
  }
}
