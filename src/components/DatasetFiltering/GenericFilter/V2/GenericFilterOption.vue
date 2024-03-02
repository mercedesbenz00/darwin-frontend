<template>
  <generic-filter-header v-if="includeHeader">
    <template #title>
      {{ headerLabel }}
    </template>
    <template #content>
      <generic-filter-option-content
        :option="option"
        :status="status"
        @toggle="status => $emit('toggle', { option, status })"
        @shift-toggle="status => $emit('shift-toggle', { option, status })"
      />
    </template>
  </generic-filter-header>
  <generic-filter-option-content
    v-else
    :option="option"
    :status="status"
    @toggle="status => $emit('toggle', { option, status })"
    @shift-toggle="status => $emit('shift-toggle', { option, status })"
  />
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  Ref
} from 'vue'

import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter/types'
import { TriToggleStatus } from '@/utils'

import GenericFilterHeader from './GenericFilterHeader.vue'
import GenericFilterOptionContent from './GenericFilterOptionContent.vue'

export default defineComponent({
  name: 'GenericFilterOption',
  components: { GenericFilterHeader, GenericFilterOptionContent },
  props: {
    option: {
      required: true,
      type: Object as PropType<GenericFilterOptionType>
    },
    status: {
      type: String as () => TriToggleStatus,
      default: 'none'
    }
  },
  setup (props) {
    const includeHeader: Ref<boolean> = computed(() => {
      return props.option.includeHeader
    })

    const headerLabel: Ref<string> = computed(() => {
      switch (props.option.type) {
      case 'assignees': return 'Annotators'
      case 'filenames': return 'Files'
      case 'paths': return 'Folders'
      default: throw new Error(`Mixed filter option type cannot be ${props.option.type}`)
      }
    })

    return {
      headerLabel,
      includeHeader
    }
  }
})
</script>
