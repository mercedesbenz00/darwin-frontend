export type InterpolationAlgorithm =
  'linear-1.0' |
  'linear-1.1' |
  undefined

export type InterpolationParams = {
  algorithm: InterpolationAlgorithm
}

export type LinearInterpolationParams = InterpolationParams & {
  interpolationFactor: number
}
