<template>
  <component
    :is="iconTag"
    v-if="isValidType"
    class="annotation-type-icon"
    :style="iconStyle"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { AnnotationTypeName } from '@/store/types'
import { anyToHSLA, modifyHSLA, hslaString } from '@/utils'

import {
  AttributesIcon,
  BoundingBoxIcon,
  CuboidIcon,
  DirectionalVectorIcon,
  EllipseIcon,
  GraphIcon,
  InstanceIdIcon,
  KeypointIcon,
  LineIcon,
  LinkIcon,
  MaskIcon,
  PolygonIcon,
  SkeletonIcon,
  StringIcon,
  TableIcon,
  TagIcon,
  TextIcon
} from './assets/icons'
import { annotationTypeNameValidator } from './utils'

// those sub-types should not be
// showed on the UI
const BLACKLIST = [
  'auto_annotate',
  'inference',
  'measures'
]

/**
 * Component to render the icon for annotation type icon
 * @param name Lower-case name of the annotation type from the backend
 * @param color Any type of color string as an overlay color to the svg file
 */
@Component({
  name: 'type-icon',
  components: {
    AttributesIcon,
    BoundingBoxIcon,
    CuboidIcon,
    DirectionalVectorIcon,
    EllipseIcon,
    GraphIcon,
    InstanceIdIcon,
    KeypointIcon,
    LineIcon,
    LinkIcon,
    MaskIcon,
    PolygonIcon,
    SkeletonIcon,
    StringIcon,
    TableIcon,
    TagIcon,
    TextIcon
  }
})
export default class TypeIcon extends Vue {
  @Prop({ required: true, validator: annotationTypeNameValidator })
  type!: AnnotationTypeName

  @Prop({ required: false })
  color!: string | null

  get colorWithFallback (): string {
    return this.color || this.$theme.getColor('colorFeatherLight')
  }

  get iconTag (): string {
    return `${this.type.replace('_', '-')}-icon`
  }

  get isValidType (): boolean {
    return !BLACKLIST.includes(this.type)
  }

  get iconStyle (): {
    '--first-color': string;
    '--second-color': string;
    } {
    const hsla = anyToHSLA(this.colorWithFallback)
    return {
      '--first-color': hslaString(hsla),
      '--second-color': hslaString(modifyHSLA(hsla, { l: Math.min(hsla.l * 2, 90) }))
    }
  }
}
</script>

<style lang="scss" scoped>
.annotation-type-icon {
  width: 23px;
  height: 23px;
}
</style>
