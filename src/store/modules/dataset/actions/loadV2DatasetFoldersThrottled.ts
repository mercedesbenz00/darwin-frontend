import throttle from 'lodash/throttle'

export const loadV2DatasetFoldersThrottled = throttle(
  ({ dispatch }, payload) => dispatch('loadV2DatasetFolders', payload),
  10000,
  { leading: true, trailing: true }
)
