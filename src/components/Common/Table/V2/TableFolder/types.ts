import { DatasetFolderPayload } from '@/store/types/DatasetFolderPayload'

export type TableFolderProps = {
  tableId: string
  data: DatasetFolderPayload
  readonly: boolean
  urlPrefix: string | null
}
