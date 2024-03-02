import throttle from 'lodash/throttle'

export const loadV2DatasetItemCountsThrottled = throttle(
  ({ dispatch }, payload) => dispatch('loadV2DatasetItemCounts', payload),
  2500,
  { leading: false, trailing: true }
)
