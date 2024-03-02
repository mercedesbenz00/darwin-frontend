import { DatasetItemPayload, V2DatasetItemPayload } from '@/store/types'

/**
 * A single item being rendered in the scroller
 *
 * It represents either an image, or a page request for a set of images to be
 * loaded from the backend.
 *
 * The id must be computed in a way that makes the overall collection sortable by it.
 */
export type BottomBarItem = {
  id: string
  data?: DatasetItemPayload
  loading?: boolean,
  size?: number
}

export type BottomBarItemV2 = {
  id: string
  data?: V2DatasetItemPayload
  loading?: boolean,
  size?: number
}
