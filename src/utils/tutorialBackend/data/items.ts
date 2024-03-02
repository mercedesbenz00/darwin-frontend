import { DatasetItemPayload } from '@/store/types'
import TutorialError from '@/utils/tutorialBackend/TutorialError'
import { createItem } from '@/utils/tutorialBackend/factories'

import { dataset } from './dataset'
import {
  autoAnnotate,
  boundingBoxes,
  classification,
  complexPolygons,
  congrats,
  discard,
  layers,
  panAndZoom,
  review,
  subAnnotations,
  switchingClasses,
  text,
  tracking1,
  tracking2
} from './images'
import { workflowTemplates } from './workflowTemplates'

const defaultTemplate = workflowTemplates.find(t => t.dataset_id === dataset.id)

if (!defaultTemplate) {
  throw new TutorialError('Workflow Template data invalid. Cannot find template for dataset')
}

export const panAndZoomItem: DatasetItemPayload = createItem(panAndZoom, defaultTemplate)
export const boundingBoxesItem: DatasetItemPayload = createItem(boundingBoxes, defaultTemplate)

export const switchingClassesItem: DatasetItemPayload =
  createItem(switchingClasses, defaultTemplate)

export const autoAnnotateItem: DatasetItemPayload = createItem(autoAnnotate, defaultTemplate)
export const layersItem: DatasetItemPayload = createItem(layers, defaultTemplate)
export const reviewItem: DatasetItemPayload = createItem(review, defaultTemplate, 2)
export const tracking1Item: DatasetItemPayload = createItem(tracking1, defaultTemplate)
export const tracking2Item: DatasetItemPayload = createItem(tracking2, defaultTemplate)
export const discardItem: DatasetItemPayload = createItem(discard, defaultTemplate)
export const classificationItem: DatasetItemPayload = createItem(classification, defaultTemplate)
export const subAnnotationsItem: DatasetItemPayload = createItem(subAnnotations, defaultTemplate)
export const complexPolygonsItem: DatasetItemPayload = createItem(complexPolygons, defaultTemplate)
export const textItem: DatasetItemPayload = createItem(text, defaultTemplate)
export const congratsItem: DatasetItemPayload = createItem(congrats, defaultTemplate)
