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
import {
  AnnotationClassPayload,
  DatasetItemType,
  RootState,
  V2DatasetItemPayload,
  V2DatasetItemSlot
} from '@/store/types'
import { addZeros, formatFileSize } from '@/utils'

/**
 * Renders sample item during model training setup, when selecting a dataset.
 */
@Component({
  name: 'item-sample-v2',
  components: { Card, CardTags, StatusIcon }
})
export default class ItemSampleV2 extends Vue {
  @Prop({ required: true })
  data!: V2DatasetItemPayload

  @State((state: RootState) => state.aclass.classesById)
  classesById!: Record<number, AnnotationClassPayload>

  get type (): DatasetItemType {
    return this.data.slot_types[0]
  }

  get file (): V2DatasetItemSlot | undefined {
    const { slots } = this.data
    if (slots.length > 0) {
      return slots[0]
    }
  }

  get thumbnail (): string {
    const { file } = this
    if (!file) { throw new Error('Invalid item.') }

    const { thumbnail_url: thumbnailUrl } = file
    if (thumbnailUrl) { return thumbnailUrl }

    throw new Error('Invalid item.')
  }

  get tags (): AnnotationClassPayload[] {
    return (this.data.tags || []).map(id => this.classesById[id])
  }

  get dimensionInfo (): string {
    const { file } = this
    if (!file) { throw new Error('Invalid item.') }

    const metadata = file.metadata
    if (!metadata || !metadata.width || !metadata.height) { return '' }

    const { width, height } = metadata
    return `${width}x${height}`
  }

  get filesizeInfo (): string {
    const { file } = this
    return file ? formatFileSize(file.size_bytes) : ''
  }

  get originalFileName (): string {
    return this.data.name
  }

  get date (): string {
    return moment(this.data.updated_at).format('DD/MM/YY')
  }

  get seq (): string {
    return addZeros(1)
  }
}
</script>

<style lang="scss" scoped>
.item-card__status-icon {
  width: 100%;
  height: 100%;
}
</style>
