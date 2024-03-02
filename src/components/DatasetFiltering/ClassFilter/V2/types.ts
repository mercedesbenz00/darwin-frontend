import { AnnotationClassPayload } from '@/store/types'

export type ClassFilterItemType = {
  id: number
  aclass: AnnotationClassPayload | null,
  label: string
  icon: string
  count: number | null
}

export type ClassFilterItemProps = {
  data: ClassFilterItemType
  status: String
  actionDisabled: boolean
  actionHide: boolean
}

export type ClassFilterProps = {
  options: ClassFilterItemType[]
  positiveOptions: number[]
  negativeOptions: number[]
  imagesSelecting: boolean
  listOnly: boolean
}
