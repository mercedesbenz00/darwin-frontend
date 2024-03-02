import throttle from 'lodash/throttle'

export const loadDatasetItemCountsThrottled = throttle(
  ({ dispatch }, payload) => dispatch('loadDatasetItemCounts', payload),
  2500,
  { leading: true, trailing: true }
)
