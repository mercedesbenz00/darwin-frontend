<template>
  <div class="skeleton-node-id">
    <div class="skeleton-node-id__header">
      <span
        v-for="(color, index) of colors"
        :key="`color${index}`"
        class="skeleton-node-id__header__item"
        :style="{ background: `#${color}` }"
      />
    </div>
    <div class="skeleton-node-id__label">
      {{ label }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { chromaHash } from '@/components/WorkView/utils'

@Component({
  name: 'skeleton-node-id'
})
export default class SkeletonNodeId extends Vue {
  @Prop({ required: true })
  label!: string

  get colors (): string[] {
    return chromaHash(this.label, 3)
  }
}
</script>

<style lang="scss" scoped>
.skeleton-node-id {
  @include col--center;
  max-width: 120px;
  background: transparentize($colorAliceBlue, .5);
  border-radius: 2px;
  overflow: hidden;
}

.skeleton-node-id__header {
  @include row--center;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
  opacity: .5;
}

.skeleton-node-id__header__item {
  flex: 1;
  min-width: 10px;
  height: 100%;
}

.skeleton-node-id__label {
  width: 100%;
  @include ellipsis(1, sm);
  @include typography(sm);
  text-align: center;
  color: $color90Black;
  padding: 0 3px;
}
</style>
