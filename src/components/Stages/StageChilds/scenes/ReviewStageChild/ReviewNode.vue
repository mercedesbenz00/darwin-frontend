<template>
  <div class="node__container">
    <div class="node__wrapper">
      <div
        class="node__icon"
        :class="`node__icon--${variant}`"
      >
        <h3 class="node-icon__label">
          if
        </h3>
      </div>
      <h3
        class="node__label"
        :class="`node__label--${variant}`"
      >
        {{ variant }}
      </h3>
    </div>
    <div class="node--edge__wrapper">
      <StageEdge
        edge-type="out"
        :scale="scale"
        :stage-id="stage.id"
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
import { V2ReviewStagePayload } from '@/store/types/V2WorkflowStagePayload'

export default defineComponent({
  name: 'ReviewNode',
  components: { StageEdge },
  props: {
    scale: { type: Number, required: true },
    stage: { type: Object as () => V2ReviewStagePayload, required: true },
    variant: { type: String as ()  => 'accepted' | 'rejected', required: true }
  },
  setup (props) {
    const edgeName = computed(() => props.variant === 'accepted' ? 'approve' : 'reject' )

    return { edgeName }
  }
})
</script>

<style lang='scss' scoped>
@import "@/components/Stages/assets/styles/mixins.scss";

.node__container {
  position: relative;
  display: block;
  padding: 10px;
  border-bottom: 1px solid $colorStrokeStrong;
}

.node__wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.node__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1px 4px;
  border-radius: 4px;
  margin-right: 4px;

  &--accepted {
    background: $colorStatusPositive;
  }
  &--rejected {
    background: $colorStatusNegative;
  }
}

.node-icon__label {
  @include typography(sm, inter, 500);
  color: $colorNeutralsLightWhite;
}

.node__label {
  @include typography(md, inter, 500);
  text-transform: capitalize;

  &--accepted {
    color: $colorSemanticPositive400;
  }
  &--rejected {
    color: $colorSemanticLightNegative400;
  }
}

.node--edge__wrapper {
  @include edgeNode;

  justify-content: flex-end;
}
</style>
