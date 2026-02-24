import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

function safeDate(timestamp: any): string {
  try {
    if (!timestamp) return new Date().toISOString()
    const ms = typeof timestamp === 'number' && timestamp < 1e12 ? timestamp * 1000 : timestamp
    const d = new Date(ms)
    if (isNaN(d.getTime())) return new Date().toISOString()
    return d.toISOString()
  } catch {
    return new Date().toISOString()
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!
  let event: any

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.supabase_user_id
        const plan = session.metadata?.plan
        if (!userId) {
          console.error('No user ID in session metadata')
          break
        }
        let periodEnd = new Date().toISOString()
        let cancelAtPeriodEnd = false
        if (session.subscription) {
          try {
           const sub = await stripe.subscriptions.retrieve(session.subscription as string) as any
           periodEnd = safeDate(sub.current_period_end)
           cancelAtPeriodEnd = sub.cancel_at_period_end || false
          } catch (e) {
            console.error('Failed to retrieve subscription:', e)
          }
        }
        const { error } = await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: 'active',
          plan: plan || 'monthly',
          current_period_end: periodEnd,
          cancel_at_period_end: cancelAtPeriodEnd,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        if (error) {
          console.error('Supabase upsert error:', error)
          throw error
        }
        console.log('Subscription activated for user:', userId)
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object
        const { error } = await supabaseAdmin.from('subscriptions').update({
          status: sub.status,
          current_period_end: safeDate(sub.current_period_end),
          cancel_at_period_end: sub.cancel_at_period_end || false,
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)
        if (error) console.error('Update error:', error)
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        const { error } = await supabaseAdmin.from('subscriptions').update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)
        if (error) console.error('Delete error:', error)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        if (!invoice.subscription) break
        const { error } = await supabaseAdmin.from('subscriptions').update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', invoice.subscription)
        if (error) console.error('Invoice error:', error)
        break
      }
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
  return NextResponse.json({ received: true })
}
