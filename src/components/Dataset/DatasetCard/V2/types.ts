import { DatasetPayload } from '@/store/types'

export type DatasetCardProps = {
  dataset: DatasetPayload
  selectable: boolean
  disabled?: boolean
}
