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
      :readonly="readonly"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import { useStore } from '@/composables'
import { useActiveView, useEditorV2 } from '@/composables/useEditorV2'
import { StageAnnotation } from '@/store/modules/workview/types'
import {
  AnnotationClassPayload,
  AnnotationData,
  AnnotationTypePayload,
  isImageAnnotationDataPayload,
  isVideoAnnotationDataPayload
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

export default defineComponent({
  name: 'LayerBarItemSubAnnotations',
  components: {
    AttributesItem,
    DirectionalVectorItem,
    InstanceIdItem,
    MeasuresItem,
    TextItem
  },
  props: {
    annotation: { required: true, type: Object as () => StageAnnotation },
    annotationClass: { required: true, type: Object as () => AnnotationClassPayload },
    readonly: { required: false, default: false, type: Boolean }
  },
  setup (props) {
    const { resolveEditor } = useEditorV2()
    const editor = resolveEditor()
    if (!editor) { throw new Error('Editor was not injected into the app') }

    const activeView = useActiveView()

    const { state, getters } = useStore()

    const renderMeasures = computed(() => state.workview.renderMeasures)
    const renderSubAnnotations = computed(() => state.workview.renderSubAnnotations)
    const subAnnotationTypesForClass = computed(
      (): (aClass: AnnotationClassPayload) => AnnotationTypePayload[] =>
        getters['aclass/subAnnotationTypesForClass']
    )

    const subAnnotationTypes = computed(() => {
      const subAnnotationTypes = subAnnotationTypesForClass.value(props.annotationClass)
      const allowed = ['attributes', 'directional_vector', 'instance_id', 'text']
      const allowedSubAnnotationTypes: AnnotationTypePayload[] = []

      allowed.forEach((name) => {
        const matched = subAnnotationTypes.find((a) => a.name === name)
        if (!matched) { return }
        allowedSubAnnotationTypes.push(matched)
      })
      return allowedSubAnnotationTypes
    })

    const nonMeasureItems = computed((): SubAnnotationItem[] => {
      const items: SubAnnotationItem[] = []

      subAnnotationTypes.value.forEach((annotationType) => {
        const { name } = annotationType

        const data = isVideoAnnotationDataPayload(props.annotation.data)
          ? activeView.value
            .annotationManager
            .inferVideoSubAnnotationDataOnly(props.annotation.data)
          : isImageAnnotationDataPayload(props.annotation.data)
            ? props.annotation.data
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
    })

    const showMeasures = computed(() => {
      return renderMeasures.value && !!activeView.value.measureManager.measureRegion
    })

    const measureItem = computed((): SubAnnotationItem | null => {
      const { measureOverlayDataEntries } = activeView.value.measureManager
      const measureOverlay = measureOverlayDataEntries[props.annotation.id]
      if (!measureOverlay) { return null }
      return {
        annotationType: 'measures',
        component: 'measures-item',
        data: measureOverlay.measures
      }
    })

    const subAnnotationItems = computed(() => {
      const subAnnotationItems: SubAnnotationItem[] = []
      if (renderSubAnnotations.value || props.annotation.isSelected) {
        subAnnotationItems.push(...nonMeasureItems.value)
      }
      if (showMeasures.value && measureItem.value) {
        subAnnotationItems.push(measureItem.value)
      }

      return subAnnotationItems
    })

    return {
      subAnnotationItems
    }
  }
})
</script>

<style lang="scss" scoped>
.sub-annotations {
  @include col;

  & > *:not(:last-child) {
    margin-bottom: 2px;
  }
}
</style>
