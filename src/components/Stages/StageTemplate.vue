<template>
  <div
    class="stage"
    :class="{ 'stage--active': selected }"
    :style="{ '--highlightColor': themeAttrs.highlightColor }"
    @click.stop="$emit('click')"
  >
    <div
      class="stage__head"
      :class="{
        'stage__head--in-only': themeAttrs.edges[0] && !themeAttrs.edges[1],
        'stage__head--out-only': themeAttrs.edges[1] && !themeAttrs.edges[0]
      }"
    >
      <StageEdge
        class="stage__head__edge"
        v-if="themeAttrs.edges[0]"
        :scale="scale"
        edge-type="in"
        :type="stage.type"
        :stage-id="stage.id"
        name="default"
      />
      <div class="stage__head__content">
        <div class="stage__head__content__icon">
          <slot name="icon" />
        </div>
        <h3 class="stage__head__content__title">
          {{ stageName }}
        </h3>
        <ItemCount :stage-id="stage.id" />
      </div>
      <StageEdge
        v-if="themeAttrs.edges[1]"
        class="stage__head__edge"
        :scale="scale"
        edge-type="out"
        :type="stage.type"
        :stage-id="stage.id"
        :edge="stage.edges[0]"
        :name="'default'"
      />
    </div>
    <div
      class="stage__content"
      v-if="!!$slots['content']"
    >
      <slot name="content" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted } from 'vue'

import { useStore } from '@/composables/useStore'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { useEditedWorkflow } from '@/pinia/useEditedWorkflow'
import { V2WorkflowStagePayload } from '@/store/types'
import { stageTheme } from '@/utils/workflowStageTheme'

import ItemCount from './ItemCount.vue'
import StageEdge from './StageEdge/StageEdge.vue'

export default defineComponent({
  name: 'StageTemplate',
  components: { ItemCount, StageEdge },
  props: {
    scale: { type: Number, required: true },
    stage: { type: Object as () => V2WorkflowStagePayload, required: true },
    selected: { default: false, required: false, type: Boolean }
  },
  setup (props, { emit }) {
    const workflowScene = useWorkflowSceneStore()
    const store = useStore()
    const Z_INDEX_SELECTED = 1005
    const Z_INDEX_DEFAULT = 1004

    const stageHeight = 'auto'
    const stageWidth = 240

    const zoomScale = computed(() => workflowScene.zoomScale)

    const { updateStageConfig } = useEditedWorkflow()

    const onDrag = (x: number, y: number): void => {
      const roundedX = Math.round(x)
      const roundedY = Math.round(y)

      updateStageConfig({
        stageId: props.stage.id,
        config: {
          x: roundedX,
          y: roundedY
        }
      })

      emit('on-drag', { x: roundedX, y: roundedY })
    }

    const unplugStage = (args: { stageId: string }): void => {
      store.commit('v2Workflow/UNPLUG_STAGE', args.stageId)
    }

    const deleteStage = (args: { stageId: string }): void => {
      unplugStage(args)
      store.commit('v2Workflow/REMOVE_STAGE', args.stageId)
      workflowScene.selectStage(null)
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.target === null) { return }
      if (event.target.localName === 'input') { return }
      if ((event.key === 'Backspace' || event.key === 'Delete') && props.selected) {
        deleteStage({ stageId: props.stage.id })
      }
    }

    onMounted(() => {
      window.addEventListener('keydown', onKeyDown)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', onKeyDown)
    })

    const themeAttrs = computed(() => stageTheme[props.stage.type])
    const stageName = computed(() => props.stage.name || themeAttrs.value.stageTitle)

    return {
      onDrag,
      onKeyDown,
      stageName,
      stageHeight,
      stageWidth,
      themeAttrs,
      zoomScale,
      Z_INDEX_DEFAULT,
      Z_INDEX_SELECTED
    }
  }
})
</script>

<style lang="scss" scoped>
@import "@/components/Stages/assets/styles/mixins.scss";

.stage {
  display: block;
  max-height: 435px;
  background: $colorNeutralsLightWhite;
  box-shadow: $shadowLightXS;
  border-radius: 12px;
  border: none;
  z-index: var(--z-index-stage-container);

  &--active {
    &::after {
      content: '';
      display: block;
      position: absolute;
      top: -2px;
      left: -2px;
      width: 100%;
      height: 100%;
      border-radius: 12px;
      border: 2px solid var(--highlightColor);
      box-shadow: 0 2px 4px -1px rgba(49, 51, 53, 0.2);
      z-index: var(--z-index-stage-highlight);
      transition: all 225ms ease;
    }
  }

  &__head {
    position: relative;
    height: 100%;
    width: 100%;

    &__edge {
      position: absolute;
      top: calc(50% - 7px);

      &:first-child {
        left: -7px;
      }

      &:last-child {
        right: -7px;
      }
    }

    &__content {
      position: relative;
      flex: 1;
      display: grid;
      align-items: center;
      grid-template-columns: 20px 1fr auto;
      grid-template-rows: 1fr;
      grid-gap: 4px;
      width: 100%;
      padding: 10px;

      &__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
      }

      &__title {
        user-select: none;
        max-width: 100%;
        @include ellipsis(1, md-1);
        @include typography(md-1, inter, 500);
      }
    }
  }

  &__content {
    display: block;
    height: calc(100% - 81px);
    border-top: 1px solid $colorNeutralsLight300;
  }
}

</style>
