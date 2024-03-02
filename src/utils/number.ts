import { pluralize } from '@/utils/pluralize'

export const formatCurrency = (
  amount: number,
  currency: string = 'usd',
  fractions: number = 2
): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toLocaleUpperCase(),
    minimumFractionDigits: fractions
  })
  return formatter.format(amount)
}

export const formatSubCurrency = (amount: number, currency: string = 'usd'): string =>
  formatCurrency(amount / 100, currency)

export const formatDecimal = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'decimal' }).format(value)

const integerFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  maximumFractionDigits: 0
})

/**
 * Format amount credit with specified number of decimals
 * @param amount credit amount to format
 * @param fractions number of decimals, default: 2
 * @returns formatted credit
 */
export const formatCredit = (
  amount: number, fractions: number = 2
): string => {
  return amount.toFixed(fractions) + ' ' + pluralize(amount, 'credit', 'credits', false)
}

/**
 * Format credit after dividing 100
 */
export const formatSubCredit = (amount: number): string =>
  formatCredit(amount / 100)

export const formatInteger = (value: number): string => integerFormatter.format(value)

export const clamp = (num: number, min: number, max: number): number =>
  Math.min(Math.max(num, min), max)
