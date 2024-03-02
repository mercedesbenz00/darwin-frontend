<template>
  <component
    :is="componentName"
    :style="iconStyle"
    v-if="klass || type"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import {
  IconDuotoneBoundingBox,
  IconDuotoneTag,
  IconDuotonePolygon
} from '@/assets/icons/V2/Duotone'
import { AnnotationClassPayload } from '@/store/types'
import { hslaString, parseRGBA, rgbaToHSLA } from '@/utils'

type AnnotationIconStyle = {
  '--first-color': string,
  '--second-color': string,
  '--stroke-opacity': number,
  '--fill-opacity': number
}

export default defineComponent({
  name: 'AnnotationClassIcon',
  components: {
    IconDuotoneBoundingBox,
    IconDuotoneTag,
    IconDuotonePolygon
  },
  props: {
    color: { type: String, required: false, default: null },
    klass: { type: Object as () => AnnotationClassPayload, required: false, default: null },
    type: { type: String, required: false, default: 'tag' }
  },
  setup (props) {
    const normalizedType = computed((): string => {
      const type = props.klass?.annotation_types.find(type =>
        ['bounding_box', 'tag', 'polygon'].includes(type))

      return (type || props.type)?.replace('_', '-') || ''
    })
    const componentName = computed(() =>  `icon-duotone-${normalizedType.value}`)
    
    const iconStyle = computed<AnnotationIconStyle>(() => {
      const style = {
        '--first-color': '#000',
        '--second-color': '#777',
        '--stroke-opacity': 1,
        '--fill-opacity': 0.2
      }

      const color = props.klass?.metadata._color || props.color

      if (color) {
        const hsl = rgbaToHSLA(parseRGBA(color))

        hsl.s -= 15

        if (hsl.l < 60) {
          hsl.l += 15
        }

        style['--first-color'] = color
        style['--second-color'] = hslaString(hsl)
      }

      return style
    })
    return { componentName, iconStyle, normalizedType }
  }
})
</script>
