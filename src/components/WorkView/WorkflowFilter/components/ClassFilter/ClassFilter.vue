<template>
  <class-filter
    :options="filterClassOptions"
    :positive-options="positiveClassIds"
    :negative-options="negativeClassIds"
    @change="onSelectedClassChange"
    list-only
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import ClassFilter from '@/components/DatasetFiltering/ClassFilter/V2/ClassFilter.vue'
import { ClassFilterItemType } from '@/components/DatasetFiltering/ClassFilter/V2/types'
import {
  AnnotationClassPayload,
  AnnotationTypePayload,
  DatasetItemCountsPayload,
  DatasetPayload,
  RootState
} from '@/store/types'

@Component({
  name: 'workflow-filter-class-filter',
  components: { ClassFilter }
})
export default class WorkflowFilterClassFilter extends Vue {
  @Prop({ required: false, default: () => [] })
  positiveClassIds!: string[]

  @Prop({ required: false, default: () => [] })
  negativeClassIds!: string[]

  @State((state: RootState) => state.workview.dataset)
  dataset!: DatasetPayload

  @State((state: RootState) => state.aclass.types)
  annotationTypes!: AnnotationTypePayload[]

  @State((state: RootState) => state.workview.datasetItemCounts)
  counts!: DatasetItemCountsPayload | null

  @State((state: RootState) => state.aclass.classesById)
  classesById!: Record<number, AnnotationClassPayload>

  get filterClassOptions (): ClassFilterItemType[] {
    return (this.counts?.class_counts || [])
      .map(({ id, name, count }) =>
        ({ id, aclass: this.classesById[id], label: name, icon: '', count }))
      .filter(({ aclass }) =>
        aclass?.datasets.some(d => d.id === this.dataset.id))
  }

  onSelectedClassChange (evt: {
    positiveOptions: number[],
    negativeOptions: number[]
  }): void {
    this.$emit('update:positive-class-ids', evt.positiveOptions)
    this.$emit('update:negative-class-ids', evt.negativeOptions)
    this.$emit('change', evt)
  }
}
</script>
