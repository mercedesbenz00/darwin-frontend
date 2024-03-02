import { ChartDimension } from './types'

export const dimensionLabels: { [k in ChartDimension]: string } = {
  annotationTime: 'Time spent annotating',
  avgTimePerAnnotation: 'Avg seconds per annotation',
  imagesAnnotated: 'Total images annotated',
  annotationsCreated: 'Total annotations created',
  reviewPassRate: 'Review pass rate'
}
