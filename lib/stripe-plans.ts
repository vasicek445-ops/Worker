export const PLANS = {
  monthly: {
    name: 'Měsíční',
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    price: 19.99,
    interval: 1,
    currency: 'EUR',
  },
  quarterly: {
    name: '3-měsíční',
    priceId: process.env.STRIPE_QUARTERLY_PRICE_ID!,
    price: 45.99,
    interval: 3,
    currency: 'EUR',
  },
} as const

export type PlanKey = keyof typeof PLANS
