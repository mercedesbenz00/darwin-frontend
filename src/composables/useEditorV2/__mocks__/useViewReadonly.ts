import { ref, Ref } from 'vue'

export const useViewReadonly = (): Ref<boolean> => {
  const readonly = ref<boolean>(false)

  return readonly as Ref<boolean>
}
