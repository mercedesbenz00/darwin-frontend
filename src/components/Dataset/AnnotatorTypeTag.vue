<template>
  <div
    class="annotator-type-tag"
    :class="`annotator-type-tag--${annotatorType.id}`"
  >
    <svg-overlay
      :width="32"
      :height="32"
      :url="annotatorType.icon"
    />
    <span>{{ annotatorType.label }}</span>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator'

import SvgOverlay from '@/components/Common/SVGOverlay.vue'

type AnnotatorType = {
  id: string
  label: string
  icon: string
}

@Component({ name: 'annotator-type-tag', components: { SvgOverlay } })
export default class AnnotatorTypeTag extends Vue {
  @Prop({ required: true })
  annotatorType!: AnnotatorType
}
</script>

<style lang='scss' scoped>
.annotator-type-tag {
  @include row;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 16px 3px 3px 16px;
  border-style: solid;
  border-width: 1px;
  height: 32px;
}

.annotator-type-tag--annotate {
  border-color: $colorAssignedBlue;
  color: $colorAssignedBlue;
}

.annotator-type-tag--review {
  border-color: $colorEgg;
  color: $colorEgg;
}

:deep(.svg) {
  width: 30px !important;
  height: 30px !important;
}

span {
  @include typography(lg);
  margin: 0 10px;
  letter-spacing: 1px;
  line-height: 30px;
  user-select: none;
}
</style>
