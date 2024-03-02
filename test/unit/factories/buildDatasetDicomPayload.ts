import { DatasetVideoPayload } from '@/store/types'

type Params = Partial<DatasetVideoPayload>

export const buildDatasetDicomPayload = (params: Params = {}): DatasetVideoPayload => ({
  dataset_id: -1,
  first_frame_seq: -1,
  first_frame_thumbnail_url: '',
  fps: 0,
  id: -1,
  inserted_at: '2000-01-01T00:00:00',
  original_filename: '',
  processed_frames: 0,
  metadata: { type: 'dicom' },
  width: 100,
  height: 100,
  file_size: 10000,
  status: 'processed',
  total_frames: 0,
  updated_at: '2000-01-01T00:00:00',
  ...params
})
