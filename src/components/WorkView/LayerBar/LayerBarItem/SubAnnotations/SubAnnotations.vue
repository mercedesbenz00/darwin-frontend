<template>
  <div
    v-if="subAnnotationItems.length > 0"
    class="sub-annotations"
  >
    <component
      :is="item.component"
      v-for="(item, index) of subAnnotationItems"
      :key="index"
      class="sub-annotations__item"
      :annotation="annotation"
      :annotation-class="annotationClass"
      :data="item.data"
      :editor="editor"
      :readonly="readonly"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import { Editor } from '@/engine/editor'
import { StageAnnotation } from '@/store/modules/workview/types'
import {
  AnnotationClassPayload,
  AnnotationData,
  AnnotationTypePayload,
  isImageAnnotationDataPayload,
  isVideoAnnotationDataPayload,
  RootState
} from '@/store/types'

import AttributesItem from './AttributesItem.vue'
import DirectionalVectorItem from './DirectionalVectorItem.vue'
import InstanceIdItem from './InstanceIdItem.vue'
import MeasuresItem from './MeasuresItem.vue'
import TextItem from './TextItem.vue'

type SubAnnotationItem = {
  annotationType: string
  component: string
  data: AnnotationData
}

@Component({
  name: 'layer-bar-item-sub-annotations',
  components: {
    AttributesItem,
    DirectionalVectorItem,
    InstanceIdItem,
    MeasuresItem,
    TextItem
  }
})
export default class LayerBarItemSubAnnotations extends Vue {
  @Prop({ required: true })
  annotation!: StageAnnotation

  @Prop({ required: true })
  annotationClass!: AnnotationClassPayload

  @Prop({ required: true })
  editor!: Editor

  @Prop({ required: false, default: false, type: Boolean })
  readonly!: boolean

  @State((state: RootState) => state.workview.renderMeasures)
  renderMeasures!: boolean

  @State((state: RootState) => state.workview.renderSubAnnotations)
  renderSubAnnotations!: boolean

  @Getter('subAnnotationTypesForClass', { namespace: 'aclass' })
  subAnnotationTypesForClass!: (aClass: AnnotationClassPayload) => AnnotationTypePayload[]

  get subAnnotationTypes () {
    const { annotationClass } = this

    const subAnnotationTypes = this.subAnnotationTypesForClass(annotationClass)
    const allowed = ['attributes', 'directional_vector', 'instance_id', 'text']
    const allowedSubAnnotationTypes: AnnotationTypePayload[] = []

    allowed.forEach((name) => {
      const matched = subAnnotationTypes.find((a) => a.name === name)
      if (!matched) { return }
      allowedSubAnnotationTypes.push(matched)
    })
    return allowedSubAnnotationTypes
  }

  get nonMeasureItems (): SubAnnotationItem[] {
    const { annotation, editor } = this
    const items: SubAnnotationItem[] = []

    this.subAnnotationTypes.forEach((annotationType) => {
      const { name } = annotationType

      const data = isVideoAnnotationDataPayload(annotation.data)
        ? editor.inferVideoSubAnnotationDataOnly(annotation.data)
        : isImageAnnotationDataPayload(annotation.data)
          ? annotation.data
          : null

      if (data === null) { throw new Error('Data is invalid. Neither image nor video') }

      const subAnnotationData = data[(name as keyof typeof data)] || {}
      items.push({
        annotationType: name,
        component: name.replace('_', '-') + '-item',
        data: subAnnotationData
      })
    })

    return items
  }

  get showMeasures () {
    return this.renderMeasures && !!this.editor.measureRegion
  }

  get measureItem (): SubAnnotationItem | null {
    const { measureOverlayDataEntries } = this.editor.activeView.measureManager
    const measureOverlay = measureOverlayDataEntries[this.annotation.id]
    if (!measureOverlay) { return null }
    return {
      annotationType: 'measures',
      component: 'measures-item',
      data: measureOverlay.measures
    }
  }

  get subAnnotationItems () {
    const subAnnotationItems: SubAnnotationItem[] = []
    if (this.renderSubAnnotations || this.annotation.isSelected) {
      subAnnotationItems.push(...this.nonMeasureItems)
    }
    if (this.showMeasures && this.measureItem) {
      subAnnotationItems.push(this.measureItem)
    }

    return subAnnotationItems
  }
}
</script>

<style lang="scss" scoped>
.sub-annotations {
  @include col;

  & > *:not(:last-child) {
    margin-bottom: 2px;
  }
}
</style>
