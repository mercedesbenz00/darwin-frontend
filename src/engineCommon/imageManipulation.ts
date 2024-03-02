export type WindowLevels = [number, number]
export type ColorMap = 'default' | 'bone' | 'jet' | 'hot' | 'seismic' | 'paired'

export const MIN_WINDOW_LEVELS = 1

export type ImageManipulationFilter = {
  opacity: number
  borderOpacity: number
  contrast: number
  saturate: number
  brightness: number
  isInverted: boolean
  isImageSmoothing: boolean
  windowLevels: WindowLevels
  colorMap: ColorMap
}

export const DEFAULT_IMAGE_MANIPULATION_FILTER: ImageManipulationFilter = {
  opacity: 15,
  borderOpacity: 80,
  contrast: 100,
  saturate: 100,
  brightness: 100,
  isInverted: false,
  isImageSmoothing: false,
  windowLevels: [MIN_WINDOW_LEVELS, 65535],
  colorMap: 'default'
}
