<template>
  <sub-annotation-item
    v-if="data"
    class="directional-vector-item"
    :annotation-class="annotationClass"
    :readonly="readonly"
    type="directional_vector"
  >
    {{ label }}
  </sub-annotation-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Editor } from '@/engine/editor'
import { DirectionalVector } from '@/engine/plugins/directionalVector/types'
import { StageAnnotation } from '@/store/modules/workview/types'
import { AnnotationClassPayload } from '@/store/types'

import SubAnnotationItem from './SubAnnotationItem.vue'

@Component({
  name: 'directional-vector-item',
  components: { SubAnnotationItem }
})
export default class DirectionalVectorItem extends Vue {
  @Prop({ required: true })
  annotation!: StageAnnotation

  @Prop({ required: true })
  annotationClass!: AnnotationClassPayload

  @Prop({ required: true })
  editor!: Editor

  @Prop({ required: false, default: null })
  data!: DirectionalVector | null

  @Prop({ required: false, default: false, type: Boolean })
  readonly!: boolean

  get label () {
    if (!this.data) { return '' }
    const { angle = 0, length = 0 } = this.data
    const angleInDegrees = angle * 180 / Math.PI
    // show negative angles as positive
    const positiveAngleDegrees = ((angleInDegrees % 360) + 360) % 360
    return `A: ${positiveAngleDegrees.toFixed(2)}° L: ${length.toFixed(2)}px`
  }
}
</script>

<style lang="scss" scoped>
.directional-vector-item {
  align-items: center;

  @include typography(sm);
  color: $colorAliceNight;

  :deep(.sub-annotation-item__icon) {
    // This is because the svg icon has some left-padding.
    // To align vertically with others, add margin-left here.
    margin-left: -2px;
    margin-right: 2px;
  }
}
</style>
