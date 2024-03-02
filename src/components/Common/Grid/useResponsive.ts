import { computed, Ref } from 'vue'

import { CardSizeType, GridProps, SizeStep } from '@/components/Common/Grid'

const DEFAULT_CARD_PROPORTION = 2 / 3
const CARD_SIZES: CardSizeType[] = [
  { step: SizeStep.xs, size: 100, delta: 50 },
  { step: SizeStep.sm, size: 150, delta: 50 },
  { step: SizeStep.md, size: 200, delta: 50 },
  { step: SizeStep.lg, size: 250, delta: 50 },
  { step: SizeStep.xl, size: 400, delta: 100 },
  { step: SizeStep.xxl, size: 600, delta: 200 },
  { step: SizeStep.xxxl, size: 800, delta: 400 },
  { step: SizeStep.xxxxl, size: 1200, delta: 600 }
]

export interface ResponsiveSetup {
  cardWidth: Ref<number>
  minCardHeight: Ref<number>
  columnCount: Ref<number>
}

export const useResponsive = (
  props: GridProps,
  containerWidth: Ref<number>
): ResponsiveSetup => {
  const cardMinWidth = computed(() => {
    const cardSize = CARD_SIZES.find(cardSize => cardSize.step === props.sizeStep)
    if (cardSize) {
      return cardSize.size
    }
    return 150
  })

  const cardMaxWidth = computed(() => {
    const cardSize = CARD_SIZES.find(cardSize => cardSize.step === props.sizeStep)
    if (cardSize) {
      return cardSize.size + cardSize.delta
    }
    return 150
  })

  const columnCount = computed(() => {
    const minColumnCount = Math.floor(containerWidth.value / cardMaxWidth.value)
    const maxColumnCount = Math.ceil(containerWidth.value / cardMinWidth.value)
    if (minColumnCount === 0) {
      return 1
    } else if (maxColumnCount - minColumnCount <= 1) {
      return minColumnCount
    } else {
      return minColumnCount + Math.floor((maxColumnCount - minColumnCount) / 2)
    }
  })

  const cardWidth = computed(() => {
    return Math.floor(
      (containerWidth.value - columnCount.value * 2 * props.cardMarginLR) / columnCount.value)
  })

  const minCardHeight = computed(() => {
    return cardMinWidth.value * DEFAULT_CARD_PROPORTION
  })

  return {
    cardWidth,
    minCardHeight,
    columnCount
  }
}
