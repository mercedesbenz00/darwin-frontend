<template>
  <div
    v-if="tags.length > 0"
    class="file-set-current-tags"
  >
    <card-tags
      :tags="tagClasses"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { matchClassByName } from '@/components/Common/TagApplier/utils'
import CardTags from '@/components/DatasetManagement/Common/CardTags/V1/CardTags.vue'
import { AnnotationClassPayload, DatasetPayload, RootState } from '@/store/types'
import { getDatasetClasses } from '@/utils'

@Component({
  name: 'file-set-current-tags',
  components: { CardTags }
})
export default class FileSetCurrentTags extends Vue {
  @Prop({ required: true, type: Array as () => string[] })
  tags!: string[]

  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @State((state: RootState) => state.aclass.classes)
  annotationClasses!: AnnotationClassPayload[]

  get datasetClasses (): AnnotationClassPayload[] {
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
}
</script>

<style lang="scss" scoped>
.file-set-current-tags {
  width: 100%;
  padding: 3px 10px;
}
</style>
