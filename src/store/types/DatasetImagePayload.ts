import { ImagePayload } from './ImagePayload'

/**
 * Defines structure for backend response matching "dataset_image.json"
 */
export type DatasetImagePayload = {
  /* eslint-disable camelcase */
  dataset_id: number
  dataset_video_id: number | null
  id: number
  image: ImagePayload
  seq: number
  set: number
  /* eslint-enable camelcase */
}
