<template>
  <div class="node">
    <div class="node__wrapper">
      <div
        class="node__wrapper__icon"
        :class="`node__wrapper__icon--${variant}`"
      >
        <h3 class="node__wrapper__icon__label">
          if
        </h3>
      </div>
      <h3
        class="node__wrapper__label"
        :class="`node__wrapper__label--${variant}`"
      >
        {{ variant }}
      </h3>
    </div>
    <div class="node__wrapper--edge__wrapper">
      <stage-edge
        :stage-id="stage.id"
        :scale="scale"
        edge-type="out"
        :edge="stage.edges.find(s => s.name === edgeName)"
        :type="stage.type"
        :name="edgeName"
      />
    </div>
  </div>
</template>

<script lang='ts'>
import { computed, defineComponent } from 'vue'

import StageEdge from '@/components/Stages/StageEdge/StageEdge.vue'
import { V2WebhookStagePayload } from '@/store/types/V2WorkflowStagePayload'

export default defineComponent({
  name: 'WebhookNode',
  components: { StageEdge },
  props: {
    scale: { type: Number, required: true },
    stage: { required: true, type: Object as () => V2WebhookStagePayload },
    variant: { required: false, default: 'succeeded', type: String }
  },
  setup (props) {
    const edgeName = computed(() => {
      return props.variant === 'succeeded' ? 'succeeded' : 'failed'
    })

    return {
      edgeName
    }
  }
})
</script>

<style lang='scss' scoped>
.node {
  position: relative;
  display: block;
  padding: 10px;
  border-bottom: 1px solid $colorStrokeStrong;

  &__wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    &__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 1px 4px;
      border-radius: 4px;
      margin-right: 4px;

      &--succeeded {
        background: $colorStatusPositive;
      }

      &--failed {
        background: $colorStatusNegative;
      }

      &__label {
        @include typography(sm, inter, 500);
        color: $colorNeutralsLightWhite;
      }
    }

    &__label {
      @include typography(md, inter, 500);
      text-transform: capitalize;

      &--succeeded {
        color: $colorSemanticPositive400;
      }

      &--failed {
        color: $colorSemanticLightNegative400;
      }
    }

    &--edge__wrapper {
      position: absolute;
      top: 0;
      left: -7px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      height: 100%;
      width: calc(100% + 14px);

      justify-content: flex-end;
    }
  }
}
</style>
