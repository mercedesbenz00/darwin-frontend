import { MeasureRegionsPayload } from './MeasureRegionsPayload'

export type DatasetVideoLayout = {
  name: 'vertical' | 'horizontal' | 'grid' | 'single',
  groups: number[][]
}

export type DatasetVideoMetadata = {
  /* eslint-disable camelcase */
  size?: number,
  colorspace?: 'RGB' | 'RG16',
  measure_regions?: MeasureRegionsPayload[]
  modality?: 'CR' | 'CT' | 'MR' | 'US' | 'Mixed',
  type?: 'dicom' | 'nifti' | 'video' | 'pdf',
  layout?: DatasetVideoLayout,
  default_window?: DefaultWindow
  /* eslint-enable camelcase */
}

export type DefaultWindow = {
  min: number,
  max: number
}

export type DatasetVideoPayload = {
  /* eslint-disable camelcase */
  annotate_as_video?: boolean
  dataset_id: number
  first_frame_seq: number
  first_frame_thumbnail_url: string
  fps: number
  id: number
  metadata: DatasetVideoMetadata
  // TODO: Add backend support for this external flag for videos
  external?: boolean
  inserted_at: string
  original_filename: string
  processed_frames: number
  width: number
  height: number
  file_size: number
  status: string
  total_frames: number
  updated_at: string,
  streamable?: boolean
  /* eslint-enable camelcase */
}
