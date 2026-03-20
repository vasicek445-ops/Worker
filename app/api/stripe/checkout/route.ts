import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { PLANS, PlanKey } from '@/lib/stripe-plans'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const { planKey, userId, email } = await req.json()
    const plan = PLANS[planKey as PlanKey]

    if (!plan) {
      return NextResponse.json({ error: 'Neplatný plán' }, { status: 400 })
    }

    if (!userId || !email) {
      return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })
    }

    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    let customerId = sub?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
      })
      customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/platba/uspech`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/platba/zruseno`,
      metadata: {
        supabase_user_id: userId,
        plan: planKey,
      },
      subscription_data: {
        ...(planKey === 'quarterly' ? { trial_period_days: 3 } : {}),
        metadata: {
          supabase_user_id: userId,
          plan: planKey,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Chyba při vytváření platby' }, { status: 500 })
  }
}
