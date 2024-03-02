import {
  AnnotationClassPayload,
  AnnotationTypePayload,
  AttributePayload,
  DatasetPayload,
  DatasetItemPayload,
  StageAnnotationPayload,
  WorkflowTemplatePayload
} from '@/store/types'

import { annotations, annotationTypes, dataset, items, workflowTemplates } from './data'
import { annotationClasses } from './data/annotationClasses'
import { horseBlack, horseBrown, horseWhite, gaugePressure } from './data/attributes'

export type State = {
  annotationAttributes: AttributePayload[]
  annotationClasses: AnnotationClassPayload[]
  annotationTypes: AnnotationTypePayload[]
  /**
   * In memory storage for all stage annotations
   */
  annotations: StageAnnotationPayload[]
  dataset: DatasetPayload
  items: DatasetItemPayload[]
  workflowTemplates: WorkflowTemplatePayload[]
}

export const state: State = {
  annotationAttributes: [horseBlack, horseBrown, horseWhite, gaugePressure],
  annotationClasses,
  annotationTypes,
  annotations,
  dataset: {
    ...dataset,
    default_workflow_template_id: workflowTemplates[0].id
  },
  items,
  workflowTemplates
}

export default state
