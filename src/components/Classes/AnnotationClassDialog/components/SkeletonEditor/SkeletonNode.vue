<template>
  <div
    class="skeleton-node"
    :class="{
      'skeleton-node--no-action': engine.hasDrawingEdge || engine.hasMovingNode,
      'skeleton-node--highlighted': node.isHighlighted
    }"
    :style="nodeStyle"
  >
    <skeleton-node-id
      class="skeleton-node__id"
      :label="node.label"
    />
    <div class="skeleton-node__actions">
      <div
        class="skeleton-node__main"
        :style="{ borderColor: engine.strokeColor }"
      />
      <skeleton-node-overlay
        class="skeleton-node__overlay"
        :engine="engine"
        :node="node"
        @change="$emit('change', node)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import SkeletonNodeId from './SkeletonNodeId.vue'
import SkeletonNodeOverlay from './SkeletonNodeOverlay.vue'
import SkeletonEditorEngine from './engine/SkeletonEditorEngine'
import { SkeletonNodeType } from './engine/types'

@Component({
  name: 'skeleton-node',
  components: { SkeletonNodeId, SkeletonNodeOverlay }
})
export default class SkeletonNode extends Vue {
  @Prop({ required: true })
  engine!: SkeletonEditorEngine

  @Prop({ required: true })
  node!: SkeletonNodeType

  get nodeStyle (): { top: string, left: string } {
    const { x, y } = this.node.position
    return {
      top: `${y}px`,
      left: `${x}px`
    }
  }
}
</script>

<style lang="scss" scoped>
.skeleton-node {
  position: absolute;
  cursor: pointer;
}

.skeleton-node__actions {
  position: absolute;
  top: 0;
  left: 0;

  &:hover {
    .skeleton-node__main {
      display: none;
    }

    .skeleton-node__overlay {
      opacity: 1;
      transform: translateX(-50%) translateY(-50%);
      transition: all .3s;
      pointer-events: unset;
    }
  }
}

.skeleton-node--no-action {
  .skeleton-node__actions {
    pointer-events: none;
  }
}

.skeleton-node__main {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 15px;
  height: 15px;
  background: white;
  border-radius: 50%;
  border-width: 1px;
  border-style: solid;
  border-color: $colorFeatherLight;
  transform: translateX(-50%) translateY(-50%);
  transition: all .2s;
}

.skeleton-node--highlighted {
  .skeleton-node__main {
    width: 20px;
    height: 20px;
  }
}

.skeleton-node__id {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.skeleton-node__overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  opacity: 0;
  transform: translateX(-50%) translateY(-50%);
  transition: all .3s;
  pointer-events: none;
}
</style>
