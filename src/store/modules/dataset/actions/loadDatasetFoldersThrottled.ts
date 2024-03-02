import throttle from 'lodash/throttle'

export const loadDatasetFoldersThrottled = throttle(
  ({ dispatch }, payload) => dispatch('loadDatasetFolders', payload),
  10000,
  { leading: true, trailing: true }
)
