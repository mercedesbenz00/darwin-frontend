<template>
  <card
    class="item-card"
    :is-selected="false"
    :thumbnail="thumbnail"
    :type="type"
  >
    <template #overlay-top-right>
      <span>{{ dimensionInfo }}</span>
      <span>{{ filesizeInfo }}</span>
    </template>
    <template #status>
      <status-icon
        class="item-card__status-icon"
        show-tooltip
        :item="data"
      />
    </template>
    <template #details>
      <div>{{ originalFileName }}</div>
      <div>
        <span>{{ date }}</span>
        <span>{{ seq }}</span>
      </div>
      <card-tags :tags="tags" />
    </template>
  </card>
</template>

<script lang="ts">
import moment from 'moment'
import Component from 'vue-class-component'
import { Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Card from '@/components/DatasetManagement/Card/V1/Card.vue'
import CardTags from '@/components/DatasetManagement/Common/CardTags/V1/CardTags.vue'
import StatusIcon from '@/components/DatasetManagement/Status/V1/DatasetItemStatusIcon.vue'
import { AnnotationClassPayload, DatasetItemPayload, RootState } from '@/store/types'
import { addZeros, formatFileSize } from '@/utils'

/**
 * Renders sample item during model training setup, when selecting a dataset.
 */
@Component({
  name: 'item-sample',
  components: { Card, CardTags, StatusIcon }
})
export default class ItemSample extends Vue {
  @Prop({ required: true })
  data!: DatasetItemPayload

  @State((state: RootState) => state.aclass.classesById)
  classesById!: Record<number, AnnotationClassPayload>

  get type (): 'video' | 'image' {
    const { dataset_video: datasetVideo, dataset_image: datasetImage } = this.data
    if (datasetImage) { return 'image' }
    if (datasetVideo) { return 'video' }
    throw new Error('Invalid dataset item. Neither image nor video')
  }

  get thumbnail (): string {
    const { dataset_video: datasetVideo, dataset_image: datasetImage } = this.data
    if (datasetVideo) { return datasetVideo.first_frame_thumbnail_url }
    if (datasetImage) { return datasetImage.image.thumbnail_url }
    throw new Error('Invalid dataset item. Neither image nor video')
  }

  get tags (): AnnotationClassPayload[] {
    return this.data.labels.map(id => this.classesById[id])
  }

  get dimensionInfo (): string {
    return (this.data.width && this.data.height)
      ? `${this.data.width}x${this.data.height}`
      : ''
  }

  get filesizeInfo (): string {
    return this.data.file_size ? formatFileSize(this.data.file_size) : ''
  }

  get originalFileName (): string {
    return this.data.filename
  }

  get date (): string {
    return moment(this.data.updated_at).format('DD/MM/YY')
  }

  get seq (): string {
    return addZeros(this.data.seq)
  }
}
</script>

<style lang="scss" scoped>
.item-card__status-icon {
  width: 100%;
  height: 100%;
}
</style>
