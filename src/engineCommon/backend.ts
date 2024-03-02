import { Rectangle } from '@/engineCommon/rectangle'

/* eslint-disable camelcase */

export type ModelMetadata = {
  id: string
  name: string
  type: string
}

export type InferenceMetadata = {
  confidence: number
  model: ModelMetadata
}

export type InferenceResult = {
  id?: string
  path?: { x: number, y: number }[]
  /**
   * both label and name are currently used for class names
   * different models will have different outputs
   */
  label?: string,
  /**
   * both label and name are currently used for class names
   * different models will have different outputs
   */
  name?: string,
  complex_polygon?: {x: number, y: number}[][]
  bounding_box?: {x: number, y: number, w: number, h: number}
  inference?: InferenceMetadata,
  text?: {text: string}
}

type Crop = Rectangle<'Image'>

export interface Click {
  x: number,
  y: number,
  type: 'add' | 'remove'
}

type ImagePayload = { url: string } | { base64: string }

/* eslint-disable camelcase */
export interface AutoAnnotateInferencePayload {
  image: ImagePayload,
  bbox: Crop,
  dicom?: { window_low: number, window_high: number},
  threshold?: number
}
/* eslint-enable camelcase */

/* eslint-disable camelcase */
export interface InferenceData {
  image: ImagePayload,
  data: {
    bbox: Crop,
    clicks: Click[],
    dicom?: { window_low: number, window_high: number},
    threshold?: number
  }
}
/* eslint-enable camelcase */

/* eslint-disable camelcase */
export type ParsedInferenceData = {
  image: ImagePayload,
  data?: {
    bbox: {x: number, y: number, w: number, h: number},
    clicks?: { x: number, y: number, type: 'add' | 'remove' }[],
    dicom?: { window_low: number, window_high: number },
    threshold?: number
  },
  bbox?: {x: number, y: number, w: number, h: number},
  threshold?: number
}
/* eslint-enable camelcase */

const parseBbox = (bbox: Crop) => ({
  x: bbox.left,
  y: bbox.top,
  w: bbox.width,
  h: bbox.height
})

export const isClickerData = (
  inferenceData: InferenceData | AutoAnnotateInferencePayload
): inferenceData is InferenceData => {
  return 'data' in inferenceData
}

export const parseInferenceData = (
  inferenceData: InferenceData | AutoAnnotateInferencePayload
): ParsedInferenceData => {
  const bbox = isClickerData(inferenceData)
    ? parseBbox(inferenceData.data.bbox)
    : parseBbox(inferenceData.bbox)

  if (!isClickerData(inferenceData)) {
    return {
      image: inferenceData.image,
      bbox,
      threshold: inferenceData.threshold
    }
  }

  const data: ParsedInferenceData['data'] = {
    bbox,
    threshold: inferenceData.data.threshold
  }

  if (inferenceData.data.clicks) {
    data.clicks = inferenceData.data.clicks.map((click) =>
      ({ x: click.x, y: click.y, type: click.type })
    )
  }

  if (isClickerData(inferenceData) && inferenceData.data.dicom) {
    data.dicom = {
      window_low: inferenceData.data.dicom.window_low,
      window_high: inferenceData.data.dicom.window_high
    }
  }

  return { image: inferenceData.image, data }
}
