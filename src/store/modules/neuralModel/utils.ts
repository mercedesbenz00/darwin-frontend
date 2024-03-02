import { NeuralModelState, NeuralModelValidationErrors } from '@/store/modules/neuralModel/types'
import { AnnotationClassPayload } from '@/store/types'
import { ModelType } from '@/utils/wind/types'

export const validateNewModel = (state: NeuralModelState): NeuralModelValidationErrors => {
  const errors: NeuralModelState['newModelValidationErrors'] = {}

  if (state.newModelSelectedClassIds.length === 0) {
    errors.classes = 'You must select one or more classes to train on.'
  }

  if (
    state.newModelType === ModelType.Classification &&
    state.newModelSelectedClassIds.length < 2
  ) {
    errors.classes = 'You must select at least two classes to train on.'
  }

  if (!state.newModelDataset) {
    errors.dataset = 'You must select a dataset to train on.'
  }

  if (!state.newModelTemplate) {
    errors.template = 'You must select a template for the model.'
  }

  if (!state.newModelName || state.newModelName.length === 0) {
    errors.name = 'You must provide a unique name for the model.'
  }

  if (state.newModelSampleItems.length === 0 && state.newModelSampleItemsV2.length === 0) {
    errors.items = 'The dataset contains no applicable items to train on.'
  }

  return errors
}

const ELIGIBILITY: Record<ModelType, string[]> = {
  [ModelType.AutoAnnotation]: ['polygon'],
  [ModelType.Classification]: ['tag'],
  [ModelType.InstanceSegmentation]: ['polygon'],
  [ModelType.ObjectDetection]: ['bounding_box', 'polygon'],
  [ModelType.SemanticSegmentation]: ['polygon'],
  [ModelType.TextScanner]: ['bounding_box']
}

export const isTypeEligible = (aType: string, type: ModelType): boolean =>
  ELIGIBILITY[type].includes(aType)

export const isClassEligibleForType = (aClass: AnnotationClassPayload, type: ModelType): boolean =>
  aClass.annotation_types.some((classType) => isTypeEligible(classType, type))
