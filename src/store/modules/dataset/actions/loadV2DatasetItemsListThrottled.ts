import throttle from 'lodash/throttle'

export const loadV2DatasetItemsListThrottled = throttle(
  ({ dispatch }, payload) => dispatch('loadV2DatasetItemsList', payload),
  1000,
  { leading: true, trailing: true }
)
