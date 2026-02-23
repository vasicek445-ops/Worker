#!/bin/bash
# Woker Stripe Setup Script
# Spusť: bash setup-stripe.sh

set -e
echo "🚀 Vytvářím Stripe soubory pro Woker..."

# --- lib/stripe.ts ---
mkdir -p lib
cat > lib/stripe.ts << 'FILEEND'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})
FILEEND
echo "✅ lib/stripe.ts"

# --- lib/stripe-plans.ts ---
cat > lib/stripe-plans.ts << 'FILEEND'
export const PLANS = {
  basic: {
    name: 'Basic',
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
    price: 29,
    currency: 'CHF',
    features: [
      'Přístup k nabídkám práce',
      'AI matching skóre',
      'Email notifikace',
    ],
  },
  premium: {
    name: 'Premium',
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    price: 79,
    currency: 'CHF',
    features: [
      'Vše z Basic',
      'Prioritní zobrazení',
      'Přímý kontakt se zaměstnavateli',
      'Personalizované doporučení',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS
FILEEND
echo "✅ lib/stripe-plans.ts"

# --- lib/supabase-admin.ts ---
cat > lib/supabase-admin.ts << 'FILEEND'
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)
FILEEND
echo "✅ lib/supabase-admin.ts"

# --- app/api/stripe/checkout/route.ts ---
mkdir -p app/api/stripe/checkout
cat > app/api/stripe/checkout/route.ts << 'FILEEND'
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        supabase_user_id: userId,
        plan: planKey,
      },
      subscription_data: {
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
FILEEND
echo "✅ app/api/stripe/checkout/route.ts"

# --- app/api/stripe/webhook/route.ts ---
mkdir -p app/api/stripe/webhook
cat > app/api/stripe/webhook/route.ts << 'FILEEND'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const plan = session.metadata?.plan
        const subscriptionId = session.subscription as string

        if (!userId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          plan: plan,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await supabaseAdmin.from('subscriptions').update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await supabaseAdmin.from('subscriptions').update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.subscription) break
        await supabaseAdmin.from('subscriptions').update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', invoice.subscription as string)
        break
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
FILEEND
echo "✅ app/api/stripe/webhook/route.ts"

# --- app/api/stripe/portal/route.ts ---
mkdir -p app/api/stripe/portal
cat > app/api/stripe/portal/route.ts << 'FILEEND'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })
    }

    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: 'Žádné předplatné' }, { status: 400 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json({ error: 'Chyba' }, { status: 500 })
  }
}
FILEEND
echo "✅ app/api/stripe/portal/route.ts"

# --- app/pricing/page.tsx ---
mkdir -p app/pricing
cat > app/pricing/page.tsx << 'FILEEND'
"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useUser } from '../components/AuthGuard'

const PLANS = {
  basic: {
    name: 'Basic',
    price: 29,
    features: [
      'Přístup k nabídkám práce',
      'AI matching skóre',
      'Email notifikace',
    ],
  },
  premium: {
    name: 'Premium',
    price: 79,
    features: [
      'Vše z Basic',
      'Prioritní zobrazení',
      'Přímý kontakt se zaměstnavateli',
      'Personalizované doporučení',
    ],
  },
}

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const user = useUser()

  const handleCheckout = async (planKey: string) => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    setLoading(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planKey,
          userId: user.id,
          email: user.email,
        }),
      })
      const data = await res.json()

      if (data.error) {
        alert(data.error)
        return
      }

      window.location.href = data.url
    } catch {
      alert('Něco se pokazilo')
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-gray-500 hover:text-white mb-8 inline-block">
          ← Zpět na nabídky
        </Link>

        <h1 className="text-white text-3xl font-bold mb-2 text-center">Vyberte si plán</h1>
        <p className="text-gray-400 text-center mb-10">Najděte práci ve Švýcarsku rychleji</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`bg-[#1A1A1A] border rounded-2xl p-6 flex flex-col ${
                key === 'premium' ? 'border-[#E8302A]' : 'border-gray-800'
              }`}
            >
              {key === 'premium' && (
                <span className="bg-[#E8302A] text-white text-xs font-bold px-3 py-1 rounded-full self-start mb-3">
                  Doporučeno
                </span>
              )}

              <h2 className="text-white text-xl font-bold">{plan.name}</h2>
              <p className="text-3xl font-bold text-white mt-2">
                {plan.price} CHF
                <span className="text-sm font-normal text-gray-400">/měsíc</span>
              </p>

              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(key)}
                disabled={loading === key}
                className={`mt-6 w-full py-3 rounded-xl font-bold transition ${
                  key === 'premium'
                    ? 'bg-[#E8302A] text-white hover:opacity-90'
                    : 'bg-white text-black hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {loading === key ? 'Načítání...' : 'Vybrat plán'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
FILEEND
echo "✅ app/pricing/page.tsx"

echo ""
echo "🎉 Hotovo! Všechny soubory vytvořeny."
echo ""
echo "📋 Další kroky:"
echo "  1. Doplň klíče do .env (nano .env)"
echo "  2. Spusť SQL v Supabase Dashboard"
echo "  3. brew install stripe/stripe-cli/stripe"
echo "  4. stripe listen --forward-to localhost:3000/api/stripe/webhook"
echo "  5. npm run dev"
