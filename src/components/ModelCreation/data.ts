import { ModelType } from '@/store/types'

import { ModelTypeDefinition } from './types'

const INSTANCE_SEGMENTATION: ModelTypeDefinition = {
  name: 'Instance segmentation',
  details: 'instance-segmentation-details',
  id: ModelType.InstanceSegmentation,
  uses: ['polygon', 'bounding_box', 'tag'],
  makes: 'polygon'
}

const SEMANTIC_SEGMENTATION: ModelTypeDefinition = {
  details: 'semantic-segmentation-details',
  id: ModelType.SemanticSegmentation,
  name: 'Semantic segmentation',
  uses: ['polygon', 'bounding_box', 'tag'],
  makes: 'polygon'
}

const OBJECT_DETECTION: ModelTypeDefinition = {
  details: 'object-detection-details',
  name: 'Object detection',
  id: ModelType.ObjectDetection,
  uses: ['polygon', 'bounding_box', 'tag'],
  makes: 'polygon'
}

const CLASSIFICATION: ModelTypeDefinition = {
  details: 'classification-details',
  name: 'Classification',
  id: ModelType.Classification,
  uses: ['polygon', 'bounding_box', 'tag'],
  makes: 'tag'
}

const AUTO_ANNOTATE: ModelTypeDefinition = {
  details: 'auto-annotate-details',
  name: 'Auto annotate',
  id: ModelType.AutoAnnotation,
  uses: ['polygon'],
  makes: 'polygon'
}

/**
 * Order in list determines render order. Do not reorder.
 * */
export const TYPES = [
  INSTANCE_SEGMENTATION,
  SEMANTIC_SEGMENTATION,
  OBJECT_DETECTION,
  CLASSIFICATION,
  AUTO_ANNOTATE
]
