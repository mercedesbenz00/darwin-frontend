<template>
  <rounded-tri-toggle-button
    class="generic-filter-option-content"
    :status.sync="currentStatus"
    @toggle="onToggleStatusChange"
  >
    <component
      :is="tag"
      :status="currentStatus"
      :option="option"
    />
  </rounded-tri-toggle-button>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  ref,
  watch,
  PropType,
  Ref
} from 'vue'

import { RoundedTriToggleButton } from '@/components/Common/Button/V2'
import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter'
import { TriToggleStatus } from '@/utils'

import {
  AssigneeOption,
  FilenameOption,
  FolderOption
} from './Option'

export default defineComponent({
  name: 'GenericFilterOptionContent',
  components: {
    AssigneeOption,
    FilenameOption,
    FolderOption,
    RoundedTriToggleButton
  },
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
  setup (props, { emit }) {
    const currentStatus: Ref<TriToggleStatus> = ref('none')

    const tag: Ref<string> = computed(() => {
      switch (props.option.type) {
      case 'assignees': return 'assignee-option'
      case 'filenames': return 'filename-option'
      case 'paths': return 'folder-option'
      default: return 'filename-option'
      }
    })

    watch(() => props.status, () => {
      currentStatus.value = props.status
    }, { immediate: true })

    const onToggleStatusChange = async (event: MouseEvent): Promise<void> => {
      await nextTick()
      if (event.shiftKey) {
        emit('shift-toggle', currentStatus.value)
      } else {
        emit('toggle', currentStatus.value)
      }
    }

    return {
      currentStatus,
      tag,
      onToggleStatusChange
    }
  }
})
</script>

<style lang="scss" scoped>
.generic-filter-option-content {
  width: calc(100% - 8px);
  margin: 0 4px 0 4px;
}
</style>
