export type GridItem<T = any> = {
  data: T
  id: string
  type?: string
  skeleton?: boolean
}

export enum SizeStep {
  xs = 'xs',
  sm = 'sm',
  md = 'md',
  lg = 'lg',
  xl = 'xl',
  xxl = 'xxl',
  xxxl = 'xxxl',
  xxxxl = 'xxxxl'
}

export type CardRow = {
  id: string,
  data: GridItem[],
  padding: {id: number}[]
}

export type CardSizeType = {
  step: SizeStep,
  size: number,
  delta: number
}

/**
 * Defines props used by the grid component
 *
 * The primary usefulness of this is in tests,
 * to keep track of which props the test gives to the component.
 *
 * It also when usign the grid as a ref, as it will expose these props to typescript.
 */
export type GridProps = {
  items: GridItem[]
  loading: boolean
  sizeStep: SizeStep
  initialItemId: string | null
  emptyMessage: string | null
  cardMarginLR: number
  cardMarginTB: number
  allowInfiniteScroll: boolean
  totalCount: number
  skeletonCount: number
}
