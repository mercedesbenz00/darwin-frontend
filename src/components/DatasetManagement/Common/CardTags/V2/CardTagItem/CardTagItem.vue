<template>
  <badge
    v-tooltip="tooltipOptions"
    :label="data.name"
    :color="backgroundColor"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Badge } from '@/components/Common/Badge'
import { AnnotationClassPayload } from '@/store/types'
import { anyToRGBA } from '@/utils'

@Component({
  name: 'card-tag-item',
  components: {
    Badge
  }
})
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
    return anyToRGBA(this.data.metadata._color)
  }
}
</script>

<style lang="scss" scoped>
:deep(.tooltip--card-tag) {
  .tooltip-inner {
    background: rgba(31, 31, 31, 0.8);
    padding: 4px;
    border-radius: 3px;
  }
}
</style>
