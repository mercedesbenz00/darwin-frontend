<template>
  <div>
    <span
      class="class-pill"
      :style="style"
      v-tooltip="tooltip"
    >{{ name }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { TooltipOptions } from '@/types'
import { RGBA } from '@/utils'

@Component({ name: 'class-pill' })
export default class ClassPill extends Vue {
  @Prop({ required: true })
  color!: RGBA

  @Prop({ required: true })
  name!: string

  get style (): Record<string, string> {
    const { r, g, b } = this.color
    return {
      'background-color': `rgba(${r},${g},${b},0.24)`,
      color: `rgb(${r},${g},${b})`
    }
  }

  get tooltip (): TooltipOptions {
    return {
      content: this.name,
      placement: 'bottom'
    }
  }
}
</script>

<style lang="scss" scoped>
.class-pill {
  @include typography(xs, default, bold);
  @include ellipsis(1, md);
  max-width: 60px;
  float: left;
  border-radius: 4px;
  padding: 5px;
  white-space: nowrap;
}
</style>
