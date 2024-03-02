<template>
  <popover
    :show="show"
    placeholder="Search stages"
    @on-input="(val) => (searchValue = val)"
    :input-value="searchValue"
  >
    <template #left-icon>
      <icon-duotone-search />
    </template>
    <div class="popover-stage">
      <list-element-v2
        v-for="stage in filteredStages"
        :key="stage.id"
        :text="stage.name"
        @click="$emit('set-stage', stage)"
      >
        <template #prefix>
          <component :is="stageIcon(stage.type)" />
        </template>
      </list-element-v2>
      <list-element-v2
        text="Discard annotations"
        @click="$emit('discard-annotations')"
      >
        <template #prefix>
          <icon-duotone-trash />
        </template>
      </list-element-v2>
    </div>
  </popover>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

import {
  IconColoredDataset as DatasetIcon,
  IconColoredConsensus as ConsensusIcon,
  IconColoredReview as ReviewIcon,
  IconColoredAnnotate as AnnotateIcon,
  IconColoredCode as CodeIcon,
  IconColoredLogic as LogicIcon,
  IconColoredModel as ModelIcon,
  IconColoredComplete as CompleteIcon,
  IconColoredWebhook as WebhookIcon
} from '@/assets/icons/V2/Colored'
import { IconDuotoneSearch, IconDuotoneTrash } from '@/assets/icons/V2/Duotone'
import InputFieldV2 from '@/components/Common/InputField/V2/InputField.vue'
import ListElementV2 from '@/components/Common/ListElements/ListElementV2/ListElementV2.vue'
import Popover from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V2/Popover/Popover.vue'
import { useStore } from '@/composables'
import { StageType } from '@/store/types'
import { getStagesPath, dropConsensusInternalStages } from '@/utils/workflows'

/**
 * @Component ContextMenuPopoverStage
 * ~ Returns V2WorkflowStagePayload object onClick()
 * @param {string} type
 * @param {boolean} show
 * */

export default defineComponent({
  name: 'ContextMenuPopoverStage',
  components: {
    AnnotateIcon,
    CodeIcon,
    CompleteIcon,
    ConsensusIcon,
    DatasetIcon,
    WebhookIcon,
    IconDuotoneSearch,
    IconDuotoneTrash,
    InputFieldV2,
    ListElementV2,
    LogicIcon,
    ModelIcon,
    Popover,
    ReviewIcon
  },
  props: {
    show: { type: Boolean, default: false }
  },
  setup () {
    const searchValue = ref('')

    const { state } = useStore()

    const stageIcon = (type: StageType): string => {
      var prefix = `${type}`
      if (type === StageType.ConsensusEntrypoint) {
        prefix = 'consensus'
      } else if (type === StageType.ConsensusTest) {
        prefix = 'test'
      }
      return `${prefix}-icon`
    }

    const filteredStages = computed(() => {
      const currentDatasetId = state.dataset.currentDataset.id

      const workflow = state.v2Workflow.workflows.find(
        w => w.stages.some(
          s => 'dataset_id' in s.config && s.config.dataset_id === currentDatasetId
        )
      )
      if (!workflow) { return [] }

      return dropConsensusInternalStages(getStagesPath(
        workflow.stages.filter(
          (s) => s.type !== StageType.Discard && s.name.match(new RegExp(searchValue.value, 'ig'))
        )
      ))
    })

    return { filteredStages, stageIcon, searchValue }
  }

})
</script>

<style lang="scss" scoped>
.popover-stage {
  display: block;
  position: relative;
}
</style>
