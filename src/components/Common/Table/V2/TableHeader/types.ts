import { SortMode } from '@/components/Common/Table/V2/TableHeaderColumn/SortIcon'

export type TableHeaderProps = {
  id: string
  items: TableHeaderItem[]
}

export type TableHeaderItem = {
  label: string
  id: string

  tableId: string
  totalItems: number

  /** renders filter conditionally if action is provided */
  sortAction?: (mode?: SortMode) => void

  /** custom size since grid doesn't have to equal maxWidth. Horizontally scrollable */
  minColumnSize: number

  resizeable?: boolean
}
