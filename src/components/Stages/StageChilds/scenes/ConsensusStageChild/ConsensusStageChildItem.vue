<template>
  <div
    class="consensus-stage-child-item"
    :class="{
      'selected': isSelected
    }"
    @click.stop="onStageSelect"
  >
    <div class="stage__head">
      <div class="stage-icon__wrapper">
        <component :is="`${stage.type}-stage-icon`" />
      </div>
      <h3 class="stage__title">
        {{ stageName }}
      </h3>
    </div>
    <div class="stage__content">
      <component
        :is="`${stage.type}-stage-child`"
        :scale="scale"
        :stage="stage"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import {
  IconColoredAnnotate as AnnotateStageIcon,
  IconColoredModel as ModelStageIcon,
} from '@/assets/icons/V2/Colored'
import { CustomButton } from '@/components/Common/Button/V2'
import AnnotateStageChild from '@/components/Stages/StageChilds/scenes/AnnotateStageChild/AnnotateStageChild.vue'
import ModelStageChild from '@/components/Stages/StageChilds/scenes/ModelStageChild/ModelStageChild.vue'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { V2WorkflowStagePayload } from '@/store/types/V2WorkflowStagePayload'
import { stageTheme } from '@/utils/workflowStageTheme'

/**
 * @Component ConsensusStageChildItem
 */
export default defineComponent({
  name: 'ConsensusStageChildItem',
  components: {
    AnnotateStageIcon,
    AnnotateStageChild,
    ModelStageChild,
    CustomButton,
    ModelStageIcon,
  },
  props: {
    scale: { type: Number, required: true },
    stage: {
      type: Object as () => V2WorkflowStagePayload,
      required: true,
    },
    searchEnabled: {
      type: Boolean,
      default: false,
    },
  },
  setup (props) {
    const scene = useWorkflowSceneStore()
    const isSelected = computed(() => scene.selectedStage?.id === props.stage.id)
    const stageName = computed(
      () => props.stage.name || stageTheme[props.stage.type]
    )
    const onStageSelect = (): void => {
      scene.selectStage(props.stage)
    }
    return {
      stageName,
      onStageSelect,
      isSelected
    }
  },
})
</script>

<style lang="scss" scoped>
.consensus-stage-child-item {
  box-sizing: border-box;
  box-shadow: $shadowLightXXS;
  background: $colorNeutralsLightWhite;
  border: 1px solid $colorNeutralsLight300;
  border-radius: 8px;

  &.selected {
    border: 1px solid $colorInteractivePrimaryDefault;
  }
}

.stage__head {
  position: relative;

  display: grid;
  align-items: center;
  grid-template-columns: 20px 1fr 20px;
  grid-template-rows: 1fr;
  grid-gap: 4px;

  padding: 10px;
}

.stage-icon__wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.stage__title {
  @include typography(md-1, inter, 500);
}

.stage__content {
  display: block;
  height: calc(100% - 81px);
  border-top: 1px solid $colorNeutralsLight300;
}
</style>
