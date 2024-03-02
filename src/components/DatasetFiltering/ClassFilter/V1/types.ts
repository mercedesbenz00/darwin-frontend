import { AnnotationClassPayload } from '@/store/types'

export type ClassFilterItemType = {
  id: number
  aclass: AnnotationClassPayload | undefined,
  label: string
  icon: string
  count: number | null
  [key: string]: any
}
