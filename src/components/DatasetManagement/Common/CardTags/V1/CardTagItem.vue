<template>
  <span
    v-tooltip="tooltipOptions"
    class="card-tag-item"
    :style="{ background: backgroundColor }"
  >{{ data.name }}</span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { AnnotationClassPayload } from '@/store/types'
import { rgbaStringToHSLAString } from '@/utils'

@Component({ name: 'card-tag-item' })
export default class CardTagItem extends Vue {
  @Prop({ required: true })
  data!: AnnotationClassPayload

  @Prop({ type: Boolean, default: false })
  showTooltip?: boolean

  get tooltipOptions () {
    return this.showTooltip
      ? {
        content: this.data.name,
        placement: 'bottom',
        classes: 'tooltip--card-tag'
      }
      : undefined
  }

  get backgroundColor () {
    return rgbaStringToHSLAString(this.data.metadata._color, { l: 80 })
  }
}
</script>

<style lang="scss" scoped>
.card-tag-item {
  @include typography(sm, default, bold);
  white-space: nowrap;
  color: $colorSecondaryDark1;
  padding: 2px 3px;
  border-radius: 2px;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tooltip--card-tag {
  .tooltip-inner {
    background: rgba(31, 31, 31, 0.8);
    padding: 4px;
    border-radius: 3px;
  }
}
</style>
