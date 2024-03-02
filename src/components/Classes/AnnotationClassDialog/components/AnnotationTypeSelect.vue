<template>
  <annotation-class-section
    ref="container"
    title="Annotation Type"
    :error="error"
  >
    <div class="annotation-types">
      <annotation-type-item
        v-for="type in mainAnnotationTypeNames"
        :key="type"
        class="annotation-type-item"
        disabled-tooltip="Cannot edit main annotation type"
        :type-name="type"
        :disabled="editing"
        :selected="selectedAnnotationType === type"
        @click="selectAnnotation(type)"
      />
    </div>
  </annotation-class-section>
</template>

<script lang="ts">
import { startCase } from 'lodash'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import Info from '@/components/Common/Info.vue'
import { AnnotationTypeName, AnnotationTypePayload } from '@/store/types'

import AnnotationTypeItem from './AnnotationTypeItem.vue'
import AnnotationClassSection from './Common/AnnotationClassSection.vue'

const ORDERED_TYPES: AnnotationTypeName[] = [
  'polygon',
  'bounding_box',
  'tag',
  'mask',
  'skeleton',
  'line',
  'keypoint',
  'ellipse',
  'cuboid',
  'link',
  'string',
  'graph',
  'table'
]

@Component({
  name: 'annotation-type-select',
  components: { AnnotationClassSection, AnnotationTypeItem, Info }
})
export default class AnnotationTypeSelect extends Vue {
  @Getter('mainAnnotationTypes', { namespace: 'aclass' })
  mainAnnotationTypes!: AnnotationTypePayload[]

  @Prop({ default: null, required: true })
  selectedAnnotationType!: AnnotationTypeName | null

  @Prop({ type: Boolean, default: false, required: false })
  editing!: boolean

  @Prop({ default: null, required: false })
  error!: string | null

  $refs!: {
    container: AnnotationClassSection
  }

  get mainAnnotationTypeNames (): AnnotationTypeName[] {
    const typeMains = this.mainAnnotationTypes.map(s => s.name)
    return ORDERED_TYPES.filter(s => typeMains.includes(s))
  }

  /**
   * Annotation type names are in `snake_case`.
   *
   * This function converts them to a format frendlier for display by
   * replacing underscores with spaces and capitalizing the first letter of
   * each word.
   *
   * This is called `startCase` in lodash
   */
  formatTypeName = startCase

  public scrollTo (): void {
    this.$refs.container.scrollTo()
  }

  selectAnnotation (typeName: AnnotationTypeName): void {
    if (this.error) {
      this.$emit('update:error', null)
    }
    this.$emit('update:selectedAnnotationType', typeName)
  }
}
</script>

<style lang="scss" scoped>
.annotation-types {
  display: block;
  width: 100%;
}

.annotation-type-item {
  width: calc(50% - 10px);
  margin: 5px 0;

  &:nth-child(even) {
    margin-left: 10px;
  }

  &:nth-child(odd) {
    margin-right: 10px;
  }
}
</style>
