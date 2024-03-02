import { DatasetItemStatus } from '@/store/types'

export type StatusFilterItemType = {
  count: number | null
  icon: string
  id: string
  label: string
  /**
   * Flag that indicates whether to omit this option when all is selected or not
   */
  omitFromAllSelected: boolean
  [key: string]: any
}

export type StatusFilterItemTypeV2 = {
  count: number | null
  icon: string
  id: DatasetItemStatus
  label: string
}

export type SortOptions = {
  sortBy: string
  sortDirection: 'asc' | 'desc'
  sort: { [key: string]: 'asc' | 'desc' }
  sortString: string
}
