export type MenuItem = {
  action?: string
  color?: string
  disabled?: boolean
  icon?: string
  label: string
  tooltip?: string
}

export type GalleryItem<T = any> = {
  data: T
  id: string
}

export enum VIEW_MODE {
  CARD = 0,
  LIST = 1
}

/**
 * Defines props used by the gallery component
 *
 * The primary usefulness of this is in tests,
 * to keep track of which props the test gives to the component.
 *
 * It also when usign the gallery as a ref, as it will expose these props to typescript.
 */
export type GalleryProps = {
  items: GalleryItem[]
  loaded: boolean
  loading: boolean
  loadingMessage: string
  initialItemId?: string
  preferredCardWidth?: number
  preferredListItemHeight?: number | 'auto'
  emptyMessage?: string
  resizable?: boolean
  selectedAll?: boolean
  selectAllEnabled?: boolean
  viewMode?: number
  fixedColumnCount?: number
  cardProportion?: number
  name?: string
}
