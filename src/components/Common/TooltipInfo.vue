<template>
  <div
    v-tooltip="{ content, delay: { show: 0, hide: 0 }, html, placement, offset }"
    class="info"
    :class="{'info--active': active}"
    @mouseout="active = false"
    @mouseover="active = true"
  >
    <info-icon class="info__icon" />
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator'

import { InfoIcon } from '@/assets/icons/V1'

@Component({
  name: 'tooltip-info',
  components: { InfoIcon }
})
export default class TooltipInfo extends Vue {
  @Prop({ required: true, type: String })
  content!: string

  @Prop({ default: false, type: Boolean })
  html!: boolean

  @Prop({ default: 10, type: Number })
  offset!: number

  @Prop({ default: 'left', type: String })
  placement!: string

  active: boolean = false
}
</script>

<style lang="scss" scoped>
.info {
  @include info-icon;
}
</style>
