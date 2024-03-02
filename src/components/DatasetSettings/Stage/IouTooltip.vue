<template>
  <info popover-class="iou-tooltip__popover">
    <div class="iou-tooltip">
      <div class="iou-tooltip__left">
        <div class="iou-tooltip__left__row">
          <area-of-overlap-icon />
          <paragraph-12>Area of Overlap</paragraph-12>
        </div>
        <div class="iou-tooltip__left__row">
          <area-of-union-icon />
          <paragraph-12>Area of Union</paragraph-12>
        </div>
      </div>
      <div class="iou-tooltip__right">
        <header-4>Intersection over Union (IoU) or “Overlap”</header-4>
        <paragraph-12>
          Measured as the area of overlap between your model’s prediction and the
          ground truth, divided by their union. IoU gives an idea of how much of
          the total area of an object do your predictions tend to cover.
          Two perfectly overlapping annotations have an IoU of 100%.
        </paragraph-12>
        <paragraph-12>
          More passes means generally a lower expected overlap. For classification
          tags, an exact match across all stages is 100%. If 3 out of 4 agree, the
          overlap is 75%.
        </paragraph-12>
      </div>
    </div>
  </info>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Header4 from '@/components/Common/Header4.vue'
import Info from '@/components/Common/Info.vue'
import Paragraph12 from '@/components/Common/Paragraph12.vue'

import AreaOfOverlapIcon from './assets/areaOfOverlap.svg?inline'
import AreaOfUnionIcon from './assets/areaOfUnion.svg?inline'

export default defineComponent({
  name: 'IouTooltip',
  components: { AreaOfUnionIcon, AreaOfOverlapIcon, Header4, Info, Paragraph12 }
})

</script>

<style lang="scss" scoped>
.iou-tooltip {
  width: 480px;
  display: grid;
  grid-template-columns: auto auto;
  column-gap: 20px;
  padding: 20px;
}

.iou-tooltip__left {
  display: grid;
  grid-template-rows: 50px 1px 50px;
  align-items: start;
  row-gap: 5px;
}

.iou-tooltip__left__row {
  display: grid;
  column-gap: 10px;
  grid-template-columns: auto auto;
  align-items: center;
}

.iou-tooltip__left__row svg {
  width: 36px;
  height: 50px;
}

.iou-tooltip__left__row:first-child::after {
  display: block;
  content: "";
  grid-column: 1 / 3;
  height: 1px;
  background: $colorWhite;
}

.iou-tooltip__right > h4 {
  @include typography(sm, inter, bold);
  color: $colorWhite;
}

.iou-tooltip__left__row > p,
.iou-tooltip__right > p {
  color: $colorWhite;
}

.iou-tooltip__right > p {
  margin-bottom: 10px;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style>
.iou-tooltip__popover {
  width: 500px !important;
  max-width: 500px !important;
}
</style>
