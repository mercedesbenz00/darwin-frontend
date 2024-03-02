import { getCurrentInstance } from 'vue'

import { ThemeType } from '@/plugins/theme'

export const useTheme = (): ThemeType => {
  const vm = getCurrentInstance()
  if (!vm) {
    throw new Error(
      'getCurrentInstance() returned null. Method must be called at the top of a setup function'
    )
  }
  return vm.proxy.$theme
}
