<template>
  <div
    v-if="measures.length > 0"
    class="measures-overlay"
  >
    <div
      v-for="(measure, index) of measures"
      :key="index"
      class="measures-overlay__data"
      :style="measure.style"
    >
      {{ measure.label }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { MeasureOverlayData } from '@/engine/models'

@Component({
  name: 'measure-overlay'
})
export default class MeasureOverlay extends Vue {
  @Prop({ required: true })
  data!: MeasureOverlayData

  get measures () {
    const { measures } = this.data
    return measures.map(m => ({
      ...m,
      label: `${m.value} ${m.unit}`,
      style: {
        color: this.data.color,
        left: `${m.position.x}px`,
        top: `${m.position.y}px`,
        transform: m.center === 'HOR' ? 'translateX(-50%)' : 'translateY(-50%)'
      }
    }))
  }
}
</script>

<style lang="scss" scoped>
.measures-overlay {
  position: absolute;
}

.measures-overlay__data {
  position: absolute;
  pointer-events: none;
  @include noSelect;
  @include ellipsis(1, md-1);
  @include typography(md-1, mulish, bold);
  text-shadow: 0.8px 0.8px 0px #000000;
  padding: 0 5px;
}
</style>
