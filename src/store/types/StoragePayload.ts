export type StoragePayload = {
  /* eslint-disable camelcase */
  slug: string
  default: boolean
  name: string
  readonly: boolean
  bucket: string
  prefix?: string
  provider?: string
  region?: string // for aws
  tenant_id?: string // for azure
  base_url?: string // for minio
  role: string
  /* eslint-enable camelcase */
}
