import {
  computed,
  ref,
  watch,
  Ref,
  SetupContext
} from 'vue'

import { TriToggleStatus } from '@/utils'

import { ClassFilterItemType, ClassFilterProps } from './types'

export interface ClassFilterOptionsSetup {
  sortedOptions: Ref<ClassFilterItemType[]>
  newTagDisabled: Ref<boolean>
  optionMap: Ref<{ [id: string]: TriToggleStatus }>
  visiblePositiveOptions: Ref<string[]>
  visibleNegativeOptions: Ref<string[]>
  clearFilter: () => void,
  emitCurrent: () => void,
  updateOptionMap: (newOptionMap: { [id: string]: TriToggleStatus }) => void
}

export function useClassFilterOptions (
  props: ClassFilterProps,
  context: SetupContext,
  tagKeyword: Ref<string>
): ClassFilterOptionsSetup {
  const sortOrder = ref(0)
  const optionMap: Ref<{ [id: string]: TriToggleStatus }> = ref({})

  const sortedOptions = computed(() => {
    const options = [
      ...props.options.filter(
        i => i.label.toLowerCase().includes(tagKeyword.value.trim().toLowerCase())
      )
    ]
    options.sort((a: ClassFilterItemType, b: ClassFilterItemType) => {
      if (sortOrder.value === 0) { return 0 }
      if (a.label === b.label) { return 0 }
      if (a.label > b.label) {
        return sortOrder.value === 1 ? 1 : -1
      }
      if (a.label < b.label) {
        return sortOrder.value === 1 ? -1 : 1
      }
      return 0
    })
    return options
  })

  const visiblePositiveOptions = computed(() => {
    return Object.keys(optionMap.value).filter(key => optionMap.value[key] === 'positive')
  })

  const visibleNegativeOptions = computed(() => {
    return Object.keys(optionMap.value).filter(key => optionMap.value[key] === 'negative')
  })

  const newTagDisabled = computed(() => {
    return tagKeyword.value.trim().length === 0 ||
    sortedOptions.value.filter(option => option.label === tagKeyword.value.trim()).length > 0
  })

  const clearFilter = (): void => {
    const nextOptionMap: { [id: string]: TriToggleStatus } = {}
    props.options.forEach(({ id }) => { nextOptionMap[id] = nextOptionMap[id] || 'none' })
    optionMap.value = nextOptionMap

    context.emit('change', {
      positiveOptions: [],
      negativeOptions: []
    })
  }

  const emitCurrent = (): void => {
    context.emit('change', {
      positiveOptions: [...visiblePositiveOptions.value],
      negativeOptions: [...visibleNegativeOptions.value]
    })
  }

  const updateOptionMap = (newOptionMap: { [id: string]: TriToggleStatus }): void => {
    optionMap.value = { ...newOptionMap }
  }

  const onOptionSelectionChange = (): void => {
    const nextOptionMap: { [id: string]: TriToggleStatus } = {}
    props.positiveOptions.forEach(id => { nextOptionMap[id] = 'positive' })
    props.negativeOptions.forEach(id => { nextOptionMap[id] = 'negative' })
    props.options.forEach(({ id }) => { nextOptionMap[id] = nextOptionMap[id] || 'none' })
    optionMap.value = nextOptionMap
  }

  watch(() => props.positiveOptions, () => {
    onOptionSelectionChange()
  }, { immediate: true })

  watch(() => props.negativeOptions, () => {
    onOptionSelectionChange()
  }, { immediate: true })

  return {
    sortedOptions,
    optionMap,
    newTagDisabled,
    visiblePositiveOptions,
    visibleNegativeOptions,
    clearFilter,
    emitCurrent,
    updateOptionMap
  }
}
