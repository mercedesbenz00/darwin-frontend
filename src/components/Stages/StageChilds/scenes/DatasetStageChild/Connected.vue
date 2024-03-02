<template>
  <div class="dataset-connected__container">
    <thumbnails
      :data="dataset.thumbnails"
      :max="max"
      :variant="thumbnailVariant"
    />
    <p class="dataset-connected__label">
      {{ dataset.name }}
    </p>
    <div class="dataset-connected__attribute-wrapper">
      <attribute-stack>
        <template #primary-attribute>
          {{ totalFiles }}
        </template>
        <template #secondary-attribute>
          Files
        </template>
      </attribute-stack>
      <attribute-stack>
        <template #primary-attribute>
          {{ totalCompleted }}
        </template>
        <template #secondary-attribute>
          Completed
        </template>
      </attribute-stack>
      <attribute-stack>
        <template #primary-attribute>
          {{ totalProgress }}
        </template>
        <template #secondary-attribute>
          In progress
        </template>
      </attribute-stack>
    </div>
    <div class="dataset-connected__progress-wrapper">
      <progress-bar
        :variant="progressbarVariant"
        :value="progressValue"
      />
      <p class="dataset-connected__progress-label">
        {{ progressValue * 100 }}%
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import AttributeStack from '@/components/Common/AttributeStack/AttributeStack.vue'
import ProgressBar from '@/components/Common/ProgressBar/ProgressBar.vue'
import { ProgressBarVariant } from '@/components/Common/ProgressBar/types'
import Thumbnails from '@/components/Common/Thumbnails/Thumbnails.vue'
import { ThumbnailVariant } from '@/components/Common/Thumbnails/types'
import { DatasetDetailPayload } from '@/store/types/DatasetDetailPayload'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { DatasetPayload } from '@/store/types/DatasetPayload'

@Component({
  name: 'dataset-connected-child',
  components: {
    Thumbnails,
    AttributeStack,
    ProgressBar
  }
})
export default class DatasetConnectedChild extends Vue {
  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @Prop({ default: 4, type: Number })
  max!: number

  @Prop({ default: ProgressBarVariant.INACTIVE, type: String })
  progressbarVariant!: ProgressBarVariant

  @Prop({ default: ThumbnailVariant.SMALL, type: String })
  thumbnailVariant!: ThumbnailVariant

  @Getter('dataset/findDatasetDetailsById')
  datasetDetailsById!: (id: number) => DatasetDetailPayload | null

  get datasetDetails (): DatasetDetailPayload | null {
    return this.datasetDetailsById(this.dataset.id)
  }

  /* eslint-disable camelcase */
  get totalFiles (): number {
    const { num_images, num_videos } = this.dataset
    let totalImages = 0
    let totalVideos = 0

    if (num_images) {
      totalImages += num_images
    }

    if (num_videos) {
      totalVideos += num_videos
    }

    return totalImages + totalVideos
  }
  /* eslint-enable camelcase */

  get totalCompleted (): number {
    const completeEntry = this.datasetDetails?.status_counts.find(
      ({ status }) => status === DatasetItemStatus.complete
    )

    return completeEntry ? completeEntry.count : 0
  }

  get totalProgress (): number {
    const progressEntries = this.datasetDetails?.status_counts.filter(
      ({ status }) => status === DatasetItemStatus.archived || status === DatasetItemStatus.complete
    )

    let countSum = 0

    progressEntries?.forEach(({ count }) => (countSum += count))

    return countSum
  }

  get progressValue (): number {
    return isNaN(Number((this.totalProgress / this.totalFiles).toFixed(4)))
      ? 0
      : Number((this.totalProgress / this.totalFiles).toFixed(4))
  }
}
</script>

<style lang="scss" scoped>
.dataset-connected__container {
  display: grid;
  grid-template-rows: repeat(4, min-content);
  grid-row-gap: 6px;
  padding: 8px;
}

.dataset-connected__label {
  @include typography(md-1, inter, 500);
  color: $colorContentSecondary;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.dataset-connected__attribute-wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 2px;
}

.dataset-connected__progress-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dataset-connected__progress-label {
  @include typography(sm, inter, 500);
  color: $colorContentTertiary;
  text-align: right;
  margin-left: 10px;
}
</style>
