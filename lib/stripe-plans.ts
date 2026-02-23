export const PLANS = {
  monthly: {
    name: 'Měsíční',
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    price: 9.90,
    currency: 'EUR',
  },
  yearly: {
    name: 'Roční',
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    price: 99.90,
    currency: 'EUR',
  },
} as const

export type PlanKey = keyof typeof PLANS
