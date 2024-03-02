import { TableHeaderItem } from '@/components/Common/Table/V2/TableHeader'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'
import { V2DatasetFolderPayload } from '@/store/types/V2DatasetFolderPayload'

export type TableProps = {
  tableId: string
  headerRow: TableHeaderItem[]
  data: TableData[]
}

export type TableData = {
  id: string
  data: V2DatasetFolderPayload | DatasetItemPayload
}
