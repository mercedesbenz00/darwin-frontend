<template>
  <v-popover
    popover-class="tooltip--no-background"
    trigger="manual"
    :offset="0"
    :open.sync="active"
    @show="onPopoverShow"
  >
    <div
      class="skeleton-node-overlay"
      :style="{ borderColor: engine.strokeColor }"
    >
      <div
        class="skeleton-node-overlay__item"
        @mousedown.stop="onMoveMousedown"
      >
        <move-icon />
      </div>
      <div
        class="skeleton-node-overlay__item"
        @click.stop="onLink"
      >
        <link-icon />
      </div>
      <div
        class="skeleton-node-overlay__item"
        @click.stop="active = true"
      >
        <label-icon />
      </div>
      <div
        v-if="!engine.editing"
        class="skeleton-node-overlay__item"
        @click.stop="onRemove"
      >
        <trash-icon />
      </div>
    </div>

    <template #popover>
      <skeleton-node-id-input
        ref="nodeIdInput"
        :engine="engine"
        :node="node"
        @saved="onSaved"
      />
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import SkeletonNodeIdInput from './SkeletonNodeIdInput.vue'
import LabelIcon from './assets/label.svg?inline'
import LinkIcon from './assets/link.svg?inline'
import MoveIcon from './assets/move.svg?inline'
import TrashIcon from './assets/trash.svg?inline'
import SkeletonEditorEngine from './engine/SkeletonEditorEngine'
import { SkeletonNodeType } from './engine/types'

@Component({
  name: 'skeleton-node-overlay',
  components: { LabelIcon, LinkIcon, MoveIcon, SkeletonNodeIdInput, TrashIcon }
})
export default class SkeletonNodeOverlay extends Vue {
  @Prop({ required: true })
  engine!: SkeletonEditorEngine

  @Prop({ required: true })
  node!: SkeletonNodeType

  active: boolean = false

  $refs!: {
    nodeIdInput: SkeletonNodeIdInput
  }

  onMoveMousedown (): void {
    this.engine.setMovingNode(this.node)
  }

  onLink (): void {
    this.engine.startDrawingEdgeFromNode(this.node)
  }

  onRemove (): void {
    this.engine.removeNode(this.node)
  }

  onPopoverShow (): void {
    this.$refs.nodeIdInput.reset()
  }

  onSaved (): void {
    this.active = false
    this.$emit('change', this.node)
  }
}
</script>

<style lang="scss" scoped>
.skeleton-node-overlay {
  @include row;
  height: 25px;
  border-radius: 12px;
  border-width: 1px;
  border-style: solid;
  border-color: $colorFeatherLight;
  overflow: hidden;
  background: white;
}

.skeleton-node-overlay__item {
  @include row--center;
  width: 23px;
  height: 23px;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: $colorAliceBlue;
  }

  &:active {
    background: $colorAliceShade;
  }
}
</style>
