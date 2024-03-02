import { MeasureUnit } from './MeasureUnit'

export type MeasureRegionsPayload = {
  /* eslint-disable camelcase */
  delta: {
    x: number
    y: number
  }
  high_priority: boolean
  unit: {
    x: MeasureUnit
    y: MeasureUnit
  }
  w: number
  h: number
  x: number
  y: number
  /* eslint-enable camelcase */
}
