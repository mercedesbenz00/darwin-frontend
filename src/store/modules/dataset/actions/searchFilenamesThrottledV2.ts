import throttle from 'lodash/throttle'

export const searchFilenamesThrottledV2 = throttle(
  ({ dispatch }, payload) => dispatch('searchFilenamesV2', payload),
  1000,
  { leading: true, trailing: true }
)
