export type AClassFilter = {
  /* eslint-disable camelcase */
  annotation_type_ids?: number[]
  annotation_type_names?: string[]
  include_tags?: boolean
  teamId?: number
  dataset_ids?: number[]
  not_dataset_ids?: number[]
  /* eslint-enable camelcase */
}
