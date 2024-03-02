import throttle from 'lodash/throttle'

export const searchFilenamesThrottled = throttle(
  ({ dispatch }, payload) => dispatch('searchFilenames', payload),
  1000,
  { leading: true, trailing: true }
)
