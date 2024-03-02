<template>
  <div class="types-distribution">
    <div
      v-for="{ annotationType, total } in sortedDistribution"
      :key="annotationType.name"
    >
      <slot
        name="item"
        :type="annotationType.name"
        :label="total.toString()"
        :selected="_selectedType === annotationType.name"
      >
        <type-toggle-with-label
          :type="annotationType.name"
          :label="total.toString()"
          :selected="_selectedType === annotationType.name"
          @click="_selectedType = annotationType.name"
        />
      </slot>
    </div>
    <type-toggle-with-label
      type="polygon"
      label="All"
      :selected="_selectedType === null"
      @click="_selectedType = null"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import TypeToggleWithLabel from '@/components/Common/AnnotationType/TypeToggleWithLabel.vue'

import { AnnotationTypeCount } from './types'

@Component({
  name: 'class-distribution-annotation-types',
  components: { TypeToggleWithLabel }
})
export default class ClassDistributionAnnotationTypes extends Vue {
  @Prop({ required: true })
  distribution!: AnnotationTypeCount[]

  @Prop({ required: true })
  selectedType!: string | null

  get _selectedType (): string | null {
    return this.selectedType
  }

  set _selectedType (val: string | null) {
    this.$emit('update:selectedType', val)
    this.$emit('select', val)
  }

  get sortedDistribution (): AnnotationTypeCount[] {
    return this.distribution
      .filter((item) => item.total > 0)
      .sort((a, b) => {
        if (a.total < b.total) { return 1 }
        if (a.total > b.total) { return -1 }
        return 0
      })
  }
}
</script>

<style lang="scss" scoped>
.types-distribution {
  display: grid;
  grid-auto-flow: column;
  column-gap: 10px;
  align-items: center;
  justify-content: start;

  > * {
    width: auto;
    align-self: start;
    justify-self: start;
  }
}
</style>
