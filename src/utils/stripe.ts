// webpack will replace `process.env` keys at build time.
// aditionally, `run.sh` replaces `$STRIPE_PUBLISHABLE_KEY` at deploy time,
// so we can specify different keys for different deployments
const STRIPE_PUBLISHABLE_KEY = process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY === ''
  ? '$STRIPE_PUBLISHABLE_KEY'
  : process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY

type Options = {
  hidePostalCode?: boolean
}

type CardEvent = {
  error?: { message?: string }
  complete: boolean
}

type CardEventCallback = (event: CardEvent) => void

export type CardElement = {
  mount: (id: string) => void
  unmount: () => void
  on: (event: string, callback: CardEventCallback) => void
}

type Elements = {
  create: (type: 'card', options: Options) => CardElement
}

// We need to use the same instance of
let stripeService: {
  elements: () => Elements,
  createToken: (card: string) => Promise<{
    token: { id: string }
  }>
}

export const stripe = () => {
  if (stripeService) { return stripeService }

  const Stripe = (window as any).Stripe
  if (Stripe) {
    stripeService = Stripe(STRIPE_PUBLISHABLE_KEY)
  }

  return stripeService
}
