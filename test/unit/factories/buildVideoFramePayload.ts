import { VideoFramePayload } from '@/store/types'

export const buildVideoFramePayload = (
  params: Partial<VideoFramePayload> = {}
): VideoFramePayload => ({
  seq: 0,
  hq_key: 'hq-url',
  lq_key: 'lq-url',
  ...params
})
