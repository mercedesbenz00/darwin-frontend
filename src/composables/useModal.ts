import Vue, { getCurrentInstance, AsyncComponent, ComponentOptions } from 'vue'

interface VModal {
  show(modal: string
    | typeof Vue
    | ComponentOptions<Vue>
    | AsyncComponent, paramsOrProps?: object, params?: object, events?: object): void;
  hide(name: string, params?: object): void;
  toggle(name: string, params?: object): void;
}

export const useModal = (): VModal => {
  const vm = getCurrentInstance()
  if (!vm) {
    throw new Error(
      'getCurrentInstance() returned null. Method must be called at the top of a setup function'
    )
  }
  return vm.proxy.$modal
}
