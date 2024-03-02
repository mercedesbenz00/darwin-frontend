import md5 from 'blueimp-md5'

import {
  AnnotationClassPayload,
  DatasetItemPayload,
  DatasetItemStatus,
  StageType
} from '@/store/types'
import { V2DatasetItemPayload } from '@/store/types/V2DatasetItemPayload'
import { parseRGBA, getRGBAColorHash, rgbaString } from '@/utils'

export const classColor = (annotationClass: AnnotationClassPayload) =>
  annotationClass.metadata._color
    ? parseRGBA(annotationClass.metadata._color)
    : getRGBAColorHash(annotationClass.name)

export const classColorRGBAString = (annotationClass: AnnotationClassPayload) =>
  rgbaString(classColor(annotationClass))

export const classDisplayName = (annotationClass: AnnotationClassPayload) =>
  annotationClass.name

export const chromaHash = (value: string, bars: number = 3) => {
  const hash = md5(value)
  const colors = hash.match(/([\dABCDEF]{6})/ig)
  return colors!.slice(0, bars)
}

export const resolveThumbnail = (item: DatasetItemPayload): string => {
  if (item.dataset_image) { return item.dataset_image.image.thumbnail_url }
  if (item.dataset_video) { return item.dataset_video.first_frame_thumbnail_url }
  throw new Error('Invalid dataset item')
}

export const resolveThumbnailV2 = (item: V2DatasetItemPayload): string | null => {
  if (item.slots?.length) {
    return item.slots[0].thumbnail_url || null
  } else {
    return null
  }
}

/**
 * In some cases (tagging, move items to new) we want to keep annotations while
 * maintaining the item status of "new".
 *
 * In such cases, the item status will be "new", but the workflow itself will
 * consist of a single stage of type "complete".
 */
export const isDefaultAutoComplete = (item: DatasetItemPayload | V2DatasetItemPayload): boolean => {
  if (!item.current_workflow) { return false }
  // A simpler check here would be just to check
  //
  // item.status === DatasetItemStatus.new &&
  //   item.current_workflow.status === DatasetItemStatus.complete
  //
  // However, checking the actual structure of the workflow, which is also
  // available, feels more robust.
  //
  // Ideally, we would have the default auto complete template loaded from
  // backend, and could check by id, which is then 100% accurate.
  //
  // That being said, currently, costumers cannot create a workflow template
  // containing just a single "complete" stage, so this is good enough.
  return (
    item.status === DatasetItemStatus.new &&
      item.current_workflow.stages[1] &&
      item.current_workflow.stages[1].length === 1 &&
      item.current_workflow.stages[1][0].type === StageType.Complete &&
      item.current_workflow.stages[2] === undefined
  )
}
