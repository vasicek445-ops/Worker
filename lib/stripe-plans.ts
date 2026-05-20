export const PLANS = {
  monthly: {
    name: 'Měsíční',
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    price: 9,
    interval: 1,
    currency: 'CHF',
  },
  quarterly: {
    name: '3-měsíční',
    priceId: process.env.STRIPE_QUARTERLY_PRICE_ID!,
    price: 19,
    interval: 3,
    currency: 'CHF',
  },
} as const

export type PlanKey = keyof typeof PLANS
