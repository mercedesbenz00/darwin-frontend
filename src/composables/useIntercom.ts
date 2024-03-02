import { getCurrentInstance } from 'vue'

import VueIntercom from '@mathieustan/vue-intercom'

export const useIntercom = (): VueIntercom | undefined => {
  const vm = getCurrentInstance()
  if (!vm) {
    throw new Error(
      'getCurrentInstance() returned null. Method must be called at the top of a setup function'
    )
  }
  return vm.proxy.$intercom
}
