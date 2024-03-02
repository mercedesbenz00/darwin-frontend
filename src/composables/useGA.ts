import { getCurrentInstance } from 'vue'

import VueAnalytics from 'vue-analytics'

/**
 * This is a wrapper around a temporary helper for google analytics,
 * which makes it available with vue2 + vuex3.
 * Once we upgrade to vuex4 or higher, we could remove it.
 */
export const useGA = (): VueAnalytics => {
  const vm = getCurrentInstance()
  if (!vm) {
    throw new Error(
      'getCurrentInstance() returned null. Method must be called at the top of a setup function'
    )
  }
  return vm.proxy.$ga
}
