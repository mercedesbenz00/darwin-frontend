<template>
  <div
    class="sort-arrow"
    :style="{ color }"
  >
    <up-icon v-if="order === 'ascending'" />
    <down-icon v-else />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import DownIcon from './assets/down.svg?inline'
import UpIcon from './assets/up.svg?inline'

const orderValidator = (value: string) => ['ascending', 'descending'].indexOf(value) !== -1

@Component({
  name: 'sort-arrow',
  components: { DownIcon, UpIcon }
})
export default class SortArrow extends Vue {
  @Prop({ default: 'ascending', validator: orderValidator })
  order!: 'ascending' | 'descending'

  @Prop({ default: false, type: Boolean })
  selected!: boolean

  get color (): string {
    return this.selected
      ? this.$theme.getColor('colorBlack')
      : this.$theme.getColor('colorAliceShadow')
  }
}
</script>

<style lang="scss" scoped>
.sort-arrow {
  @include row--center;
  float: left;
  margin-right: 6px;
  padding: 2px;
}
</style>
