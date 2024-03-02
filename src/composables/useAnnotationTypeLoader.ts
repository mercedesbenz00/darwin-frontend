import { onMounted } from 'vue'

import { useStore } from './useStore'

export const useAnnotationTypeLoader = (): void => {
  const store = useStore()
  const loadAnnotationTypes = (): void => {
    store.dispatch('aclass/loadAnnotationTypes')
  }
  onMounted(() => loadAnnotationTypes())
}
