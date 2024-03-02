import { AnnotationTypeName } from '@/store/types'

export type AnnotationTypeFilterItemType = {
  id: string | number
  label: string
  icon?: string
  name: AnnotationTypeName
  color: string
  count: number | null
  [key: string]: any
}
