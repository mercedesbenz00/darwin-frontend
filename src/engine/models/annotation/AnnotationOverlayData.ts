import { AnnotationType } from '@/engineCommon/AnnotationType'

import { Annotation } from './Annotation'

export type AnnotationOverlayData = {
  readonly id: string;
  x: number;
  y: number;
  label: string;
  annotation: Annotation;
  subAnnotationTypes: AnnotationType[];
  overlays: {text: string}[];
}
