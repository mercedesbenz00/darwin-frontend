<template>
  <div class="threshold-wrapper">
    <div class="label">
      IoU
    </div>
    <TabStack
      class="threshold-tab-stack"
      :tabs="tabs"
      :size="tabSize"
      :active-tab="activeTab"
      @on-tab-click="onClickTab"
    />
    <component
      v-if="activeComponent"
      :is="activeComponent"
      :consensus-stage="consensusStage"
      :test-stage="testStage"
    />
  </div>
</template>

<script lang="ts">
import { ref, computed, defineComponent } from 'vue'

import { useStore } from '@/composables/useStore'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { StageType } from '@/store/types/StageType'
import {
  V2TestStagePayload,
} from '@/store/types/V2WorkflowStagePayload'
import { TabSize } from '@/uiKit/TabStack/TabItem/types'
import TabStack from '@/uiKit/TabStack/TabStack.vue'
import { TabStackProps } from '@/uiKit/TabStack/types'

import ClassesThreshold from './Threshold/ClassesThreshold.vue'
import General from './Threshold/General.vue'
import TypesThreshold from './Threshold/TypesThreshold.vue'

/**
 * @Component ConsensusThreshold
 */
export default defineComponent({
  components: {
    TabStack,
    General,
    ClassesThreshold,
    TypesThreshold,
  },
  name: 'ConsensusThreshold',
  setup () {
    const tabs: TabStackProps['tabs'] = [
      {
        label: 'General',
        id: 'general',
      },
      {
        label: 'Types',
        id: 'types',
      },
      {
        label: 'Classes',
        id: 'classes',
      },
    ]
    const tabSize = TabSize.SMALL
    const activeTab = ref(0)
    const scene = useWorkflowSceneStore()
    const consensusStage = computed(
      () =>
        scene.selectedStage?.type === StageType.ConsensusEntrypoint
          ? scene.selectedStage
          : undefined
    )
    const store = useStore()
    const testStage = computed(() =>
      store.state.v2Workflow.editedWorkflow?.stages.find(
        (s): s is V2TestStagePayload =>
          s.id === consensusStage.value?.config.test_stage_id
      )
    )
    const activeComponent = computed(() => {
      if (consensusStage.value?.type === 'consensus_entrypoint') {
        switch (activeTab.value) {
        case 0:
          return 'General'
        case 1:
          return 'TypesThreshold'
        case 2:
          return 'ClassesThreshold'
        default:
          return null
        }
      }
      return null
    })

    const onClickTab = (index: number): void => {
      activeTab.value = index
    }

    return {
      activeTab,
      activeComponent,
      tabs,
      tabSize,
      onClickTab,
      consensusStage,
      testStage,
    }
  },
})
</script>

<style lang="scss" scoped>
.threshold-wrapper {
  background: $colorSurfaceElevate;

  .label {
    padding: 12px;
    @include typography(md-1, inter);
  }

  .threshold-tab-stack {
    width: 100%;
  }
}
</style>
