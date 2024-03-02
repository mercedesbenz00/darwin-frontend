<template>
  <div class="data-point">
    <div class="data-point__value">
      <div
        v-if="color"
        class="data-point__value__dot"
        :style="{'background-color': color}"
      />
      {{ formattedValue }}
    </div>
    <div class="data-point__label">
      {{ label }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { formatDurationAsTimer, formatNumericValue, formatPercentageValue } from '@/utils'

@Component({ name: 'data-point' })
export default class DataPoint extends Vue {
  @Prop({ required: true })
  value!: number

  @Prop({ required: false, default: 'numeric', type: String })
  type!: 'numeric' | 'percentage'

  @Prop({ required: false, type: String })
  color!: string

  @Prop({ required: true, type: String })
  label!: string

  get formattedValue (): string {
    if (this.value === null) { return 'N/A' }
    if (this.type === 'numeric') { return formatNumericValue(this.value) }
    if (this.type === 'percentage') { return formatPercentageValue(this.value) }
    if (this.type === 'duration') { return formatDurationAsTimer(this.value) }

    throw new Error(`Uknown data point format: ${this.type}`)
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.data-point {
  @include col--left;
}

.data-point__value {
  @include row;
  align-items: center;
  font-weight: 900;
  font-size: 22px;
}

.data-point__value__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 10px;
}

.data-point__label {
  font-size: 12px;
  @include typography(md, default, normal);
  color: $colorGrayLite;
}
</style>
