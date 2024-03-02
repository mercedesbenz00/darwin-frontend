import { AnnotationClassPayload, AnnotationClassMetadata, AnnotationTypeName } from '@/store/types'

type PendingFields =
  | 'crop_key'
  | 'crop_url'
  | 'image_height'
  | 'image_width'
  | 'key'
  | 'original_image_url'
  | 'scale'
  | 'x'
  | 'y'

/**
 * Holds a class image that isn't necessarily persisted to the backend yet.
 * That means it might be missing any of the url fields
 *
 * It can be saved to backend once at least the `key` field is set, as that one
 * can be used to infer/compute all the other fields.
 *
 * - `crop_key` - repleace "original" with "crop" in `key` field
 * - `crop_url` - signed s3 url (by backend), for `crop_key`
 * - `original_image_url` - signed s3 url (by backend) for `key`
 */
export type PendingClassImage =
  Omit<AnnotationClassPayload['images'][0], PendingFields>
  & Partial<Pick<AnnotationClassPayload['images'][0], PendingFields>>

// eslint-disable-next-line camelcase
export type PendingClassImageWithUrlSet = PendingClassImage & { original_image_url: string }

export const isClassImage = (
  image: PendingClassImage
): image is AnnotationClassPayload['images'][0] =>
  !!image.key && !!image.crop_key

export type AnnotationClassData = {
  datasets: AnnotationClassPayload['datasets']
  description: string | null
  hotkey: null | string
  id: number | null
  images: PendingClassImage[]
  metadata: AnnotationClassMetadata
  name: string | null
}

export type DefaultAnnotationClassData = Partial<AnnotationClassData> & {
  selectedMainAnnotationType?: AnnotationTypeName
}

export type AnnotationClassValidationErrors = {
  annotationTypes?: string
  name?: string
  skeleton?: string
}

export const VIEWPORT_WIDTH: number = 150
export const VIEWPORT_HEIGHT: number = 150

export type CropInfo = {
  orientation: number
  points: [string, string, string, string]
  zoom: number
}

/**
 * VueCroppie is really archaic and requires us to get crop info via $ref,
 * so this type defines that ref
 */
export type Croppie = {
  /** Binds options to the underlying croppie library */
  bind: (options: Pick<CropInfo, 'points' | 'zoom'> & { url: string}) => void

  /** Retrieves current crop info */
  get: () => CropInfo
  result: (options?: Record<string, string>, callback?: Function) => void

  /** Sets scale/zoom level of cropper */
  setZoom: (value: number) => void
}
