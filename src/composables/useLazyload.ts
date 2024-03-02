import { getCurrentInstance } from 'vue'
import { VueReactiveListener } from 'vue-lazyload'

interface Lazyload {
  lazyLoadHandler(): void
  $off: (key: string, fn: (l: VueReactiveListener) => void) => void
  $once: (key: string, fn: (l: VueReactiveListener) => void) => void
  $on: (key: string, fn: (l: VueReactiveListener) => void) => void
}

export const useLazyload = (): Lazyload => {
  const vm = getCurrentInstance()
  if (!vm) {
    throw new Error(
      'getCurrentInstance() returned null. Method must be called at the top of a setup function'
    )
  }
  return vm.proxy.$Lazyload
}
