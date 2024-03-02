import { DatasetItemPayload } from '@/store/types'

import {
  autoAnnotate,
  attributes,
  boundingBox,
  cuboid,
  directionalVector,
  ellipse,
  instanceId,
  keypoint,
  line,
  polygon,
  skeleton,
  tag,
  text
} from './data/annotationTypes'
import { annotations } from './data/annotations'
import { dataset } from './data/dataset'
import {
  autoAnnotateItem,
  boundingBoxesItem,
  classificationItem,
  discardItem,
  layersItem,
  panAndZoomItem,
  reviewItem,
  subAnnotationsItem,
  switchingClassesItem,
  tracking1Item,
  tracking2Item,
  complexPolygonsItem,
  textItem,
  congratsItem
} from './data/items'
import { workflowTemplates } from './data/workflowTemplates'

/**
 * Items are intentionally defined manually, rather than with Array.prototype.map,
 * so it's clearer which have custom workflows, etc
 *
 * CAUTION: Order of items should remain constant
 */
const items: DatasetItemPayload[] = [
  panAndZoomItem,
  boundingBoxesItem,
  switchingClassesItem,
  autoAnnotateItem,
  layersItem,
  reviewItem,
  tracking1Item,
  tracking2Item,
  discardItem,
  classificationItem,
  subAnnotationsItem,
  complexPolygonsItem,
  textItem,
  congratsItem
]

const annotationTypes = [
  autoAnnotate,
  attributes,
  boundingBox,
  cuboid,
  directionalVector,
  ellipse,
  instanceId,
  keypoint,
  line,
  polygon,
  skeleton,
  tag,
  text
]

export { annotations, annotationTypes, dataset, items, workflowTemplates }
