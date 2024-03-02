<template>
  <class-filter
    ref="classFilter"
    :images-selecting="imagesSelecting"
    :list-only="listOnly"
    :options="filterClassOptions"
    :positive-options="positiveClassIds"
    :negative-options="negativeClassIds"
    @change="onSelectedClassChange"
    @create-tag="createTag"
    @tag="tagSelected"
    @untag="untagSelected"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import ClassFilter from '@/components/DatasetFiltering/ClassFilter/V1/ClassFilter.vue'
import { ClassFilterItemType } from '@/components/DatasetFiltering/ClassFilter/V1/types'
import { createAnnotationClass } from '@/store/modules/aclass/actions/createAnnotationClass'
import { loadDatasetItemCounts } from '@/store/modules/dataset/actions/loadDatasetItemCounts'
import { tagSelectedItems } from '@/store/modules/dataset/actions/tagSelectedItems'
import { untagSelectedItems } from '@/store/modules/dataset/actions/untagSelectedItems'
import {
  AnnotationClassPayload,
  AnnotationTypePayload,
  DatasetDetailPayload,
  DatasetPayload,
  RootState,
  StoreActionPayload,
  TeamPayload
} from '@/store/types'
import { ErrorCodes } from '@/utils/error/errors'

@Component({
  name: 'dataset-management-sidebar-class-filter',
  components: { ClassFilter }
})
export default class DatasetManagementSidebarClassFilter extends Vue {
  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @Prop({ required: false, default: () => [] })
  positiveClassIds!: number[]

  @Prop({ required: false, default: () => [] })
  negativeClassIds!: number[]

  @Prop({ type: Boolean, default: false })
  imagesSelecting!: boolean

  @Prop({ type: Boolean, default: false })
  listOnly!: boolean

  @State((state: RootState) => state.aclass.types)
  annotationTypes!: AnnotationTypePayload[]

  @State((state: RootState) => state.dataset.currentDataset.classCounts)
  classCounts!: DatasetDetailPayload['class_counts']

  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload

  $refs!: {
    classFilter: ClassFilter
  }

  @State((state: RootState) => state.aclass.classesById)
  classesById!: Record<number, AnnotationClassPayload>

  get filterClassOptions (): ClassFilterItemType[] {
    return this.classCounts
      .map(({ id, name, count }) => {
        const aclass = this.classesById[id]
        return { id, aclass, label: name, icon: '', count }
      })
      .filter(({ aclass }) => aclass?.datasets.some(d => d.id === this.dataset.id))
  }

  onSelectedClassChange (evt: {
    positiveOptions: number[],
    negativeOptions: number[]
  }): void {
    this.$emit('update:positive-class-ids', evt.positiveOptions)
    this.$emit('update:negative-class-ids', evt.negativeOptions)
    this.$emit('change', evt)
  }

  get tagAnnotationType (): AnnotationTypePayload | undefined {
    return this.annotationTypes.find(t => t.name === 'tag')
  }

  async createTag (keyword: string): Promise<void> {
    if (!this.tagAnnotationType) { return }
    if (!keyword) { return }

    const payload: StoreActionPayload<typeof createAnnotationClass> = {
      annotationTypeNames: [this.tagAnnotationType.name],
      datasets: [{ id: this.dataset.id }],
      description: keyword,
      images: [],
      metadata: { _color: 'auto' },
      name: keyword
    }
    await this.$store.dispatch('aclass/createAnnotationClass', payload)

    this.$refs.classFilter.resetTagInput()

    this.$store.dispatch(
      'dataset/loadDatasetItemCounts',
      { dataset: this.dataset } as StoreActionPayload<typeof loadDatasetItemCounts>
    )
  }

  async tagSelected (item: ClassFilterItemType): Promise<void> {
    const payload: StoreActionPayload<typeof untagSelectedItems> = {
      dataset: this.dataset,
      annotationClassId: item.id
    }

    const result = await this.$store.dispatch('dataset/tagSelectedItems', payload)

    if ('error' in result && result.error.code === ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE) {
      this.$store.commit('billing/SHOW_OUT_OF_STORAGE_DIALOG')
    }
  }

  untagSelected (item: ClassFilterItemType): void {
    const payload: StoreActionPayload<typeof tagSelectedItems> = {
      dataset: this.dataset,
      annotationClassId: item.id
    }

    this.$store.dispatch('dataset/untagSelectedItems', payload)
  }
}
</script>
