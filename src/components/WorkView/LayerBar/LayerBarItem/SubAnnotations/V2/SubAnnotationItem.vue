<template>
  <div
    class="sub-annotation-item"
    @click="onClick"
  >
    <type-icon
      class="sub-annotation-item__icon"
      :color="color"
      :type="type"
    />
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'
import { annotationTypeNameValidator } from '@/components/Common/AnnotationType/utils'
import { AnnotationClassPayload } from '@/store/types'

@Component({
  name: 'sub-annotation-item',
  components: { TypeIcon }
})
export default class SubAnnotationItem extends Vue {
  @Prop({ required: true })
  annotationClass!: AnnotationClassPayload

  @Prop({ required: true, validator: annotationTypeNameValidator })
  type!: string

  @Prop({ required: false, default: false, type: Boolean })
  readonly!: boolean

  get color () {
    return this.annotationClass.metadata._color
  }

  onClick () {
    if (this.readonly) { return }
    this.$emit('click')
  }
}
</script>

<style lang="scss" scoped>
.sub-annotation-item {
  @include row;
  cursor: pointer;
}

.sub-annotation-item__icon {
  width: 18px;
  min-width: 18px;
  height: 18px;
}
</style>
