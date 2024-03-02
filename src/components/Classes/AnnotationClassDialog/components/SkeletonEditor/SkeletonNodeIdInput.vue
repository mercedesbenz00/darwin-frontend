<template>
  <div class="skeleton-node-id-input">
    <input
      ref="input"
      v-model="value"
      placeholder="Node ID"
      type="text"
      @keydown.stop
      @keyup.stop
      @keyup.enter.stop="save"
    >
    <span class="skeleton-node-id-input__tip">Node ID. Press enter to save</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import SkeletonEditorEngine from './engine/SkeletonEditorEngine'
import { SkeletonNodeType } from './engine/types'

@Component({
  name: 'skeleton-node-id-input'
})
export default class SkeletonNodeIdInput extends Vue {
  @Prop({ required: true })
  engine!: SkeletonEditorEngine

  @Prop({ required: true })
  node!: SkeletonNodeType

  $refs!: Vue['$refs'] & {
    input: HTMLInputElement
  }

  value: string = ''

  mounted (): void {
    this.reset()
  }

  reset (): void {
    this.value = this.node.label || ''
    this.setFocus()
    this.selectAll()
  }

  setFocus (): void {
    setTimeout(() => {
      if (!this.$refs.input) { return }
      this.$refs.input.focus()
    }, 200)
  }

  selectAll (): void {
    if (!this.$refs.input) { return }
    this.$refs.input.setSelectionRange(0, this.value.length)
  }

  save (): void {
    if (!this.value) {
      this.$store.dispatch('toast/warning', { content: 'Skeleton Node ID cannot be empty' })
      return
    }

    this.node.label = this.value
    this.$emit('saved')
  }
}
</script>

<style lang="scss" scoped>
.skeleton-node-id-input {
  width: 200px;
  background: $colorWhite;
  border-radius: $border-radius-default;
  overflow: hidden;

  input {
    border-radius: $border-radius-default;
    @include typography(md, default);
    background: $colorLineGrey !important;
    color: $color90Black;

    width: 100%;
    padding: 0 6px 0 6px;
    max-height: 200px;
    overflow: auto;

    &::-webkit-input-placeholder {
      color: $colorAliceNight;
    }
    &::-moz-placeholder {
      color: $colorAliceNight;
    }
    &:-moz-placeholder {
      color: $colorAliceNight;
    }
    &:-ms-input-placeholder {
      color: $colorAliceNight;
    }
  }
}

.skeleton-node-id-input__tip {
  margin: 5px 10px;
  @include typography(sm, default, bold);
  color: $colorSecondaryLight;
}
</style>
