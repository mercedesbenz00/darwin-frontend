import { MeasureUnit } from './MeasureUnit'

export type AnnotationMeasure = {
  delta: {
    x: number
    y: number
  }
  unit: {
    x: MeasureUnit
    y: MeasureUnit
  }
}
