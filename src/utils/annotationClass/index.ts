import { startCase } from 'lodash'

import { AnnotationTypePayload } from '@/store/types'
import { AnnotationTypeName } from '@/store/types/AnnotationTypeName'

import richData from './AnnotationTypeRichData.json'

export * from './color'

export type AnnotationTypeRichData = {
  name: AnnotationTypeName
  description: string
  props?: string[]
  cons?: string[]
  features?: []
  richSubs?: AnnotationTypeRichPayload[]
}

export type AnnotationTypeRichPayload = AnnotationTypePayload & AnnotationTypeRichData

/**
 * Annotation type names are in `snake_case`.
 *
 * This function converts them to a format frendlier for display by
 * replacing underscores with spaces and capitalizing the first letter of
 * each word.
 *
 * This is called `startCase` in lodash
 */
export const formatTypeName = (name: string): string => {
  if (name === 'instance_id') { return 'Instance ID' }
  return startCase(name)
}

export const annotationTypeRichData: AnnotationTypeRichData[] = richData

export { getDatasetClasses } from './getDatasetClasses'
export { getNonDatasetClasses } from './getNonDatasetClasses'
