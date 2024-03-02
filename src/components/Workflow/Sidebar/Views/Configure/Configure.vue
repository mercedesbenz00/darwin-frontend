<template>
  <PanelFloatingWhite class="sidebar-configure">
    <template #header>
      <StageConfigHeader
        @copy-slug="copySlug"
        @unplug-stage="unplugStage"
        @delete-stage="deleteStage"
      />
    </template>
    <template
      v-if="childComponent"
      #content
    >
      <component
        :is="childComponent"
        :stage="stage"
      />
    </template>
    <template
      v-if="footerComponent"
      #footer
    >
      <component
        :is="footerComponent"
        class="sidebar-configure__footer"
      />
    </template>
  </PanelFloatingWhite>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import AnnotateStageSidebarChild from '@/components/Workflow/Sidebar/Childs/Annotate/AnnotateStageSidebarChild.vue'
import CompleteStageSidebarChild from '@/components/Workflow/Sidebar/Childs/Complete/CompleteStageSidebarChild.vue'
import ConsensusStageSidebarChild from '@/components/Workflow/Sidebar/Childs/Consensus/ConsensusStageSidebarChild.vue'
import DatasetStageSidebarChild from '@/components/Workflow/Sidebar/Childs/Dataset/DatasetStageSidebarChild.vue'
import ModelStageSidebarChild from '@/components/Workflow/Sidebar/Childs/Model/ModelStageSidebarChild.vue'
import ReviewStageSidebarChild from '@/components/Workflow/Sidebar/Childs/Review/ReviewStageSidebarChild.vue'
import WebhookStageSidebarChild from '@/components/Workflow/Sidebar/Childs/Webhook/WebhookStageSidebarChild.vue'
import DatasetStageSidebarFooter from '@/components/Workflow/Sidebar/Footers/Dataset/DatasetStageSidebarFooter.vue'
import ModelStageSidebarFooter from '@/components/Workflow/Sidebar/Footers/Model/ModelStageSidebarFooter.vue'
import { useStore } from '@/composables/useStore'
import { useToast } from '@/composables/useToast'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { StageType } from '@/store/types'
import PanelFloatingWhite from '@/uiKit/Panel/PanelFloatingWhite.vue'

import StageConfigHeader from './StageConfigHeader.vue'

export default defineComponent({
  name: 'SidebarConfigureView',
  components: {
    StageConfigHeader,
    PanelFloatingWhite,
    // config contents (all stages have them)
    AnnotateStageSidebarChild,
    CompleteStageSidebarChild,
    ConsensusStageSidebarChild,
    DatasetStageSidebarChild,
    ModelStageSidebarChild,
    ReviewStageSidebarChild,
    WebhookStageSidebarChild,
    // footers (not all stages have them)
    DatasetStageSidebarFooter,
    ModelStageSidebarFooter
  },
  setup () {
    const store = useStore()
    const toast = useToast()
    const scene = useWorkflowSceneStore()
    const stage = computed(() => scene.selectedStage)

    const copySlug = (args: { stageId: string }): void => {
      if (!navigator) { return }
      toast.info({
        duration: 3000,
        meta: { title: `"${args.stageId}" copied to clipboard` }
      })
      navigator.clipboard.writeText(args.stageId)
    }

    const unplugStage = (args: { stageId: string }): void => {
      store.commit('v2Workflow/UNPLUG_STAGE', args.stageId)
    }

    const deleteStage = (args: { stageId: string }): void => {
      unplugStage(args)
      store.commit('v2Workflow/REMOVE_STAGE', args.stageId)
      scene.selectStage(null)
    }

    const childComponent = computed(() => {
      if(!stage.value) { return null }
      const stageType = stage.value.type

      const prefix = (stageType === StageType.ConsensusEntrypoint)
        ? 'consensus'
        : stageType.toLowerCase()
      return `${prefix}-stage-sidebar-child`
    })

    const footerComponent = computed(() => {
      if (stage.value?.type === StageType.Dataset) {
        return 'DatasetStageSidebarFooter'
      }

      if (stage.value?.type === StageType.Model) {
        return 'ModelStageSidebarFooter'
      }

      return null
    })

    return {
      childComponent,
      copySlug,
      deleteStage,
      footerComponent,
      stage,
      unplugStage
    }
  }
})
</script>

<style lang="scss" scoped>
.sidebar-configure {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  width: 100%;

  :deep(.panel__section:nth-child(2)) {
    @include scrollbarV2('vertical');
  }

  :deep(.panel__section--footer) {
    margin-top: auto;
    box-shadow: inset 0 1px 0 #e3e4e6;
  }

  &__footer {
    height: auto;
    width: 100%;
    padding: 8px;
    margin-top: auto;
  }
}
</style>
