import { buildBillingInfoPayload } from 'test/unit/factories'

import { resolveFeaturesForPlan, resolveProductPrice, resolveUndiscountedProductPrice } from '@/components/Plans/Product/utils'

// using default pricing in buildBillingInfoPayload
const billingInfo = buildBillingInfoPayload({})

describe('resolveProductPrice', () => {
  const annotationPrices = billingInfo.prices.annotation_credits

  it('works if price is given as null', () => {
    expect(resolveProductPrice(50, null)).toEqual(0)
  })

  it('computes annotation credit standard price', () => {
    expect(resolveProductPrice(50, annotationPrices.standard)).toEqual(
      50 * 150
    )

    expect(resolveProductPrice(400, annotationPrices.standard)).toEqual(
      400 * 150
    )

    expect(resolveProductPrice(600, annotationPrices.standard)).toEqual(
      499 * 150 +
      101 * 140
    )

    expect(resolveProductPrice(1200, annotationPrices.standard)).toEqual(
      499 * 150 +
      500 * 140 +
      201 * 130
    )

    expect(resolveProductPrice(2500, annotationPrices.standard)).toEqual(
      499 * 150 +
      500 * 140 +
      1000 * 130 +
      501 * 120
    )

    expect(resolveProductPrice(7000, annotationPrices.standard)).toEqual(
      499 * 150 +
      500 * 140 +
      1000 * 130 +
      3000 * 120 +
      2001 * 100

    )

    expect(resolveProductPrice(15000, annotationPrices.standard)).toEqual(
      499 * 150 +
      500 * 140 +
      1000 * 130 +
      3000 * 120 +
      5000 * 100 +
      5001 * 80
    )

    expect(resolveProductPrice(25000, annotationPrices.standard)).toEqual(
      499 * 150 +
      500 * 140 +
      1000 * 130 +
      3000 * 120 +
      5000 * 100 +
      10000 * 80 +
      5001 * 60
    )
  })

  it('computes annotation credit bonus price', () => {
    expect(resolveProductPrice(50, annotationPrices.bonus)).toEqual(0)
    expect(resolveProductPrice(500, annotationPrices.bonus)).toEqual(0)
  })

  const storagePrices = billingInfo.prices.storage

  it('computes storage standard price', () => {
    expect(resolveProductPrice(50, storagePrices.standard)).toEqual(0)
    expect(resolveProductPrice(999, storagePrices.standard)).toEqual(0)
    expect(resolveProductPrice(1000, storagePrices.standard)).toEqual(0)
    expect(resolveProductPrice(1100, storagePrices.standard)).toEqual(1000)
    expect(resolveProductPrice(2000, storagePrices.standard)).toEqual(10000)
  })
})

describe('resolveUndiscountedProductPrice', () => {
  const annotationPrices = billingInfo.prices.annotation_credits

  it('works if price is given as null', () => {
    expect(resolveUndiscountedProductPrice(50, null)).toEqual(0)
  })

  it('computes annotation credit standard price', () => {
    [50, 400, 600, 1200, 2500, 7000, 15000, 25000].forEach(amount => {
      expect(resolveUndiscountedProductPrice(amount, annotationPrices.standard))
        .toEqual(amount * 150)
    })
  })
})

describe('resolveFeaturesForPlan', () => {
  it('returns 4 active for freemium plan', () => {
    const features = resolveFeaturesForPlan('freemium')
    expect(features.filter(feature => feature.enabled)).toHaveLength(6)
    expect(features.filter(feature => !feature.enabled)).toHaveLength(12)
  })

  it('returns 7 active for team plan', () => {
    const features = resolveFeaturesForPlan('team')
    expect(features.filter(feature => feature.enabled)).toHaveLength(7)
    expect(features.filter(feature => !feature.enabled)).toHaveLength(9)
  })

  it('returns 11 active for business plan', () => {
    const features = resolveFeaturesForPlan('business')
    expect(features.filter(feature => feature.enabled)).toHaveLength(11)
    expect(features.filter(feature => !feature.enabled)).toHaveLength(5)
  })

  it('returns 16 active for enterprise plan', () => {
    const features = resolveFeaturesForPlan('enterprise')
    expect(features.filter(feature => feature.enabled)).toHaveLength(16)
    expect(features.filter(feature => !feature.enabled)).toHaveLength(0)
  })
})
