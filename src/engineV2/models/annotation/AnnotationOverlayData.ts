import { AnnotationType } from '@/engineCommon/AnnotationType'

import { Annotation } from './Annotation'

export type AnnotationOverlayData = {
  readonly id: string;
  x: number;
  y: number;
  label: string;
  annotationId: Annotation['id'];
  subAnnotationTypes: AnnotationType[];
  overlays: {text: string}[];
}
