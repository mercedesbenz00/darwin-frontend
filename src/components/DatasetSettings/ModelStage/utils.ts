import { MappedClass, UnmappedClass } from '@/components/DatasetSettings/ModelStage/types'
import { ClassMapping } from '@/store/modules/workview/types'
import {
  AnnotationClassPayload,
  AnnotationTypeName,
  ModelStageTemplatePayload,
  TrainingClass
} from '@/store/types'

const resolveClass = (
  modelClass: TrainingClass,
  annotationClasses: AnnotationClassPayload[]
): AnnotationClassPayload | null =>
  annotationClasses.find(c => c.id === modelClass.darwin_id) ||
  annotationClasses.find(c => c.name === modelClass.name) ||
  annotationClasses.find(c => c.name === modelClass.display_name) ||
  null

/**
 * Attempts to automatically assign an annotation class to each model class,
 * taking any already present assignment as the initial set of values.
 *
 * The rules are
 *
 * - if there's already a previous assignment, even null, take that
 * - assign trying to match `modelClass.darwin_id` with `annotationClass.id`
 * - assign trying to match `modelClass.name` with `annotationClass.name`
 * - assign trying to match `modelClass.name` with `annotationClass.name`
 */
export const automapClasses = (
  modelClasses: TrainingClass[],
  annotationClasses: AnnotationClassPayload[]
): (MappedClass | UnmappedClass)[] =>
  modelClasses.map(modelClass => ({
    annotationClass: resolveClass(modelClass, annotationClasses),
    modelClass
  }))

const isStageMapping =
  (m: ModelStageTemplatePayload['metadata']['class_mapping'] | ClassMapping):
  m is ModelStageTemplatePayload['metadata']['class_mapping'] => {
    if (m === undefined) { return true }
    if (m.length === 0) { return true }

    const firstMapping = m[0]
    if ('annotation_class_id' in firstMapping) { return true }

    return false
  }

/**
 * Takes model classes, a list of available annotation classes and class mapping
 * from an existing model stage template and returns a list of mapped/unmapped
 * classes, without any attempts to resolve the classes automatically.
 */
export const premapClasses = (
  modelClasses: TrainingClass[],
  annotationClasses: AnnotationClassPayload[],
  stageClassMapping: ModelStageTemplatePayload['metadata']['class_mapping'] | ClassMapping
): (MappedClass | UnmappedClass)[] => {
  if (isStageMapping(stageClassMapping)) {
    const initialMapping = stageClassMapping || []
    return modelClasses.map(modelClass => {
      const premapped = initialMapping.find(i => i.model_class_label === modelClass.name)

      const annotationClass = premapped
        ? annotationClasses.find(c => c.id === premapped.annotation_class_id) || null
        : null

      return {
        annotationClass, modelClass
      }
    })
  } else {
    const initialMapping = stageClassMapping || []
    return modelClasses.map(modelClass => {
      const premapped = initialMapping.find(i => i.modelClassLabel === modelClass.name)

      const annotationClass = premapped
        ? annotationClasses.find(c => c.id === premapped.annotationClassId) || null
        : null

      return {
        annotationClass, modelClass
      }
    })
  }
}

export const toClassMapping = (
  m: (MappedClass | UnmappedClass)
): ClassMapping[0] => ({
  annotationClassId: m.annotationClass ? m.annotationClass.id : null,
  modelClassLabel: m.modelClass.name
})

export const toStageClassMapping = (
  m: (MappedClass | UnmappedClass)
): Exclude<ModelStageTemplatePayload['metadata']['class_mapping'], undefined>[0] => ({
  annotation_class_id: m.annotationClass ? m.annotationClass.id : null,
  model_class_label: m.modelClass.name
})

/**
 * Determines if the two specified annotation types are compatible
 *
 * Compatible types can be mapped one onto another in model stages.
 *
 * DEV: The current implementation names the two arguments as it matters which
 * is which, even though it technically does not. This might change in the
 * future, howerver, so it's safer to approach it this way.
 */
export const areTypesCompatible =
  (classType: AnnotationTypeName, modelType: AnnotationTypeName): boolean => {
    if (classType === 'polygon' && modelType === 'bounding_box') { return true }
    if (classType === 'bounding_box' && modelType === 'polygon') { return true }
    return classType === modelType
  }
