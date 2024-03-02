<template>
  <tags-popover
    class="tool"
    :dataset="dataset"
    :tags="tags"
    v-tooltip="'Add classification tag'"
    @change="onSetTags"
  >
    <div class="tool__content">
      <icon-mono-tag />
      <div v-if="tags.length > 0">
        <card-tags
          :tags="tagClasses"
          :max-items="3"
        />
      </div>
    </div>
  </tags-popover>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import { IconMonoTag } from '@/assets/icons/V2/Mono'
import { matchClassByName } from '@/components/Common/TagApplier/utils'
import TagsPopover from '@/components/Dataset/DropZone/FileSet/TagsPopover.vue'
import CardTags from '@/components/DatasetManagement/Common/CardTags/V2/CardTags/CardTags.vue'
import { AnnotationClassPayload, Dataset, DatasetPayload, RootState } from '@/store/types'
import { getDatasetClasses } from '@/utils'

@Component({
  name: 'tags-tool',
  components: {
    IconMonoTag,
    TagsPopover,
    CardTags
  }
})
export default class TagsTool extends Vue {
  @State((state: RootState) => state.dataset.currentDataset)
  currentDataset!: Dataset

  @State((state: RootState) => state.aclass.classes)
  annotationClasses!: AnnotationClassPayload[]

  @Getter('findById', { namespace: 'dataset' })
  datasetById!: (id: number) => DatasetPayload | null

  get tags (): string[] {
    return this.$store.state.datasetUpload.tags || []
  }

  get dataset (): DatasetPayload | null {
    if (!this.currentDataset.id) { return null }
    return this.datasetById(this.currentDataset.id)
  }

  get datasetClasses (): AnnotationClassPayload[] {
    if (!this.dataset) { return [] }

    return getDatasetClasses(this.annotationClasses, this.dataset.id)
  }

  get datasetTagClasses (): AnnotationClassPayload[] {
    return this.datasetClasses.filter(aclass => aclass.annotation_types.includes('tag'))
  }

  get tagClasses (): AnnotationClassPayload[] {
    const tagClasses: AnnotationClassPayload[] = []

    this.tags.forEach((tag) => {
      const aclass = matchClassByName(this.datasetTagClasses, tag)
      if (!aclass) { return }
      tagClasses.push(aclass)
    })

    return tagClasses
  }

  onSetTags (tags: string[]): void {
    this.$store.commit('datasetUpload/SET_COMMON_TAGS', tags)
    this.$store.commit('datasetUpload/SET_COMMON_TAG_CLASSES', this.tagClasses)
  }
}
</script>

<style lang="scss" scoped>
.tool {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: $colorContentSecondary;
  font-size: 13px;
  padding: 0 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background .3s;

  &:hover, &.open {
    background: $colorInteractiveSecondaryPressed;
  }

  &__content {
    display: flex;
    align-items: center;
  }

  &__text {
    margin-left: 5px;
  }
}
</style>
