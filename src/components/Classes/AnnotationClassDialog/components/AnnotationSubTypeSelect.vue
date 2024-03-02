<template>
  <annotation-class-section
    v-if="isRendering"
    title="Subtypes"
    optional
  >
    <div class="annotation-types">
      <annotation-type-item
        v-for="type in annotationSubtypes"
        :key="type"
        class="annotation-type-item"
        disabled-tooltip="Cannot remove existing subtypes"
        :type-name="type"
        :disabled="originalSubTypeSelections[type]"
        :selected="typeSelections[type]"
        @click="updateSubAnnotation(type)"
      />
    </div>
  </annotation-class-section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Info from '@/components/Common/Info.vue'
import { AnnotationTypeName, AnnotationTypePayload, RootState } from '@/store/types'
import { formatTypeName } from '@/utils'

import AnnotationTypeItem from './AnnotationTypeItem.vue'
import AnnotationClassSection from './Common/AnnotationClassSection.vue'

const ORDERED_SUBS: AnnotationTypeName[] =
  ['attributes', 'text', 'directional_vector', 'instance_id']

@Component({
  name: 'annotation-sub-type-select',
  components: { AnnotationClassSection, AnnotationTypeItem, Info }
})
export default class AnnotationSubTypeSelect extends Vue {
  @Prop({ required: true })
  mainAnnotationType!: AnnotationTypeName | null

  /**
   * Once a subtype has been selected and persisted to backend,
   * it can no longer be removed from a class.
   *
   * This mapping is used to ensure this constraint.
   */
  @Prop({ required: true })
  originalSubTypeSelections!: Partial<Record<AnnotationTypeName, boolean>>

  @Prop({ required: true })
  typeSelections!: Partial<Record<AnnotationTypeName, boolean>>

  @State((state: RootState) => state.aclass.types)
  annotationTypes!: AnnotationTypePayload[]

  get annotationSubtypes (): AnnotationTypeName[] {
    const type =
      this.annotationTypes.find(t => t.name === this.mainAnnotationType && t.granularity === 'main')

    if (!type) {
      throw new Error('Invalid main type given as prop')
    }

    const typeSubs = type.subs.map(s => s.name)
    return ORDERED_SUBS.filter(s => typeSubs.includes(s))
  }

  get isRendering (): boolean {
    return this.annotationSubtypes.length > 0
  }

  formatTypeName = formatTypeName

  updateSubAnnotation (typeName: AnnotationTypeName) {
    this.$emit('update:typeSelections', {
      ...this.typeSelections,
      [typeName]: !this.typeSelections[typeName]
    })
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
