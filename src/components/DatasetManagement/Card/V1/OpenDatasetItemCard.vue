<template>
  <card
    class="item-card"
    :is-selected="isSelected"
    :thumbnail="thumbnailUrl"
    :type="isVideo ? 'video' : 'image'"
    @select="setSelection"
  >
    <template #overlay-top-right>
      <span>{{ dimensionInfo }}</span>
      <span>{{ filesizeInfo }}</span>
    </template>
    <template #overlay-center>
      <card-button :to="itemLocation">
        Open
      </card-button>
    </template>
    <template #status>
      <status-icon
        class="item-card__status-icon"
        show-tooltip
        :item="data"
      />
    </template>
    <template #details>
      <dataset-item-name :name="originalFileName" />
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
import { Location } from 'vue-router'
import { State } from 'vuex-class'

import Card from '@/components/DatasetManagement/Card/V1/Card.vue'
import CardButton from '@/components/DatasetManagement/Card/V1/CardButton.vue'
import CardTags from '@/components/DatasetManagement/Common/CardTags/V1/CardTags.vue'
import DatasetItemName from '@/components/DatasetManagement/Common/DatasetItemName.vue'
import StatusIcon from '@/components/DatasetManagement/Status/V1/DatasetItemStatusIcon.vue'
import { AnnotationClassPayload, DatasetItemPayload, RootState } from '@/store/types'
import {
  addZeros,
  formatFileSize,
  resolveOpenImageDMLocation,
  resolveOpenSplitVideoDMLocation
} from '@/utils'

/**
 * Used to render images in open datasets.
 *
 * Used when gallery is in card mode.
 */
@Component({
  name: 'open-dataset-item-card',
  components: { Card, CardButton, CardTags, DatasetItemName, StatusIcon }
})
export default class OpenDatasetItemCard extends Vue {
  @Prop({ required: true, type: Object as () => DatasetItemPayload })
  data!: DatasetItemPayload

  @Prop({ required: true, type: String })
  urlPrefix!: string

  @State((state: RootState) => state.aclass.classesById)
  classesById!: Record<number, AnnotationClassPayload>

  get isVideo (): boolean {
    return !!this.data.dataset_video_id && !!this.data.dataset_video
  }

  get thumbnailUrl (): string | null {
    if (this.isVideo) {
      return this.data.dataset_video!.first_frame_thumbnail_url
    }
    return this.data.dataset_image?.image?.thumbnail_url || null
  }

  get tags (): AnnotationClassPayload[] {
    return this.data.labels.map(id => this.classesById[id])
  }

  /**
   * readonly prop to show if the current dataset item is in annotate_as_video mode or not
   */
  get isAnnotateAsVideo (): boolean {
    return this.isVideo && !!this.data.dataset_video?.annotate_as_video
  }

  get itemLocation (): Location {
    const { $route, data, urlPrefix } = this

    if (this.isVideo && !this.isAnnotateAsVideo) {
      return resolveOpenSplitVideoDMLocation($route, data, urlPrefix)
    }
    return resolveOpenImageDMLocation($route, data, urlPrefix)
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

  // selection

  @State(state => state.dataset.selectedItemIds)
  selectedItemIds!: number[]

  get isSelected (): boolean {
    return this.selectedItemIds.indexOf(this.data.id) > -1
  }

  setSelection (e: MouseEvent, selected: boolean): void {
    if (e.shiftKey) {
      this.$emit('shift-select', selected)
    } else {
      this.$emit('select', selected)
    }
  }
}
</script>

<style lang="scss" scoped>
.item-card__status-icon {
  width: 100%;
  height: 100%;

  &:hover.status-button--archived {
    background-color: $colorCrimsonLight;
  }
}
</style>
