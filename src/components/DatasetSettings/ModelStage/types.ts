import { AnnotationClassPayload, ModelStageTemplatePayload, TrainingClass } from '@/store/types'

export type UnmappedClass = { annotationClass: null, modelClass: TrainingClass }
export type MappedClass = { annotationClass: AnnotationClassPayload, modelClass: TrainingClass }

export type StageClassMapping = Exclude<
  ModelStageTemplatePayload['metadata']['class_mapping'],
  undefined
>
