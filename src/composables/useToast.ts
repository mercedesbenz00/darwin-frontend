import { getCurrentInstance } from 'vue'
type VToast = Exclude<ReturnType<typeof getCurrentInstance>, null>['proxy']['$toast']

/**
 * This is a wrapper around a temporary helper for toast,
 * which makes it available with vue2 + vuex3.
 * Once we upgrade to vuex4 or higher, we could remove it.
 */
export const useToast = (): VToast => {
  const vm = getCurrentInstance()
  if (!vm) {
    throw new Error(
      'getCurrentInstance() returned null. Method must be called at the top of a setup function'
    )
  }
  return vm.proxy.$toast
}
