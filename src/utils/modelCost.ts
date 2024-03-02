import { ModelTier } from '@/store/modules/neuralModel/types'
import { formatSubCredit } from '@/utils'

/**
 * The ratio of dollar to credit
 */
export const CREDIT_RATIO = 1.5

/**
 * Cost in dollar for training per minute
 */
export const COST_PER_MINUTE = 50

/**
 * Credit cost per minute
 */
export const CREDIT_PER_MINUTE = 0.03

/**
 * Returns an estimated number of hours (float) it takes to train a model
 * The estimate is currently set to 1 hour per 1000 items + 1 hour padding.
 */
export const estimateTrainingHours = (itemCount: number): number => itemCount / 1000 + 1

const CENTS_PER_INSTANCE = {
  evaluation: 3,
  standard: 5,
  production: 5
}

export const instanceCost = (count: number): string => {
  const cents = count * CENTS_PER_INSTANCE.standard
  const credits = cents / CREDIT_RATIO

  return formatSubCredit(credits)
}

const REQUESTS_PER_SECOND: Record<ModelTier, number> = {
  evaluation: 1,
  standard: 10,
  production: 10
}

export const requestsPerSecond = (count: number, type: ModelTier = 'standard'): number => {
  return count * REQUESTS_PER_SECOND[type]
}
