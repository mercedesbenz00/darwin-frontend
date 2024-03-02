import VueAnalytics from 'vue-analytics'

export const useGA = (): Pick<VueAnalytics, 'event'> => {
  return { event: (): void => {} }
}
