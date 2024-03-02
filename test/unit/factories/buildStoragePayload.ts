import { StoragePayload } from '@/store/types/StoragePayload'

type StoragePayloadBuildParams = Partial<StoragePayload>

export const buildStoragePayload = (
  params: StoragePayloadBuildParams = {}
): StoragePayload => ({
  slug: 'slug_1',
  default: false,
  name: 'Slug 1',
  readonly: true,
  bucket: 'bucket',
  prefix: 'prefix',
  provider: 'aws',
  region: 'region',
  role: 'role',
  ...params
})
