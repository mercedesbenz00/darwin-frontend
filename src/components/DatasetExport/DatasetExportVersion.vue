<template>
  <div class="dataset-export">
    <div class="dataset-export__header">
      <div
        class="dataset-export__header__title"
        @click="copyToClipboard"
      >
        <h1>{{ versionName }}</h1>
        <clipboard-icon />
      </div>

      <div class="dataset-export__header__actions">
        <button
          v-if="!isOpenMode"
          v-tooltip="deleteTooltip"
          class="dataset-export__header__trash-button"
          :class="{
            'dataset-export__header__trash-button--disabled': !canDelete
          }"
          @click="deleteVersion"
        >
          <trash-icon />
        </button>

        <download-button
          v-if="datasetExport.download_url"
          class="dataset-export__header__download-button"
          :disabled="!canDownload"
          @click="downloadVersion"
        />
        <p v-else>
          Creating version...
        </p>
      </div>
    </div>
    <div class="dataset-export__body">
      <div class="dataset-export__body__date">
        {{ date }}
      </div>
      <div class="dataset-export__body__image-count">
        {{ imageCount }}
      </div>
      <div class="dataset-export__body__class-count">
        {{ classCount }}
      </div>
      <div class="dataset-export__body__type-counts">
        <div
          v-for="type in annotationTypes"
          :key="type.stored.id"
          class="dataset-export__body__type-count"
        >
          <type-icon
            class="class-distribution-table__class__name__icon"
            color="rgb(0, 217, 201)"
            :type="type.stored.name"
          />
          <div class="dataset-export__body__type-count__text">
            {{ type.count }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { TrashIcon } from '@/assets/icons/V1'
import DownloadButton from '@/components/Annotators/AnnotationMetrics/DownloadButton.vue'
import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'
import {
  AnnotationTypePayload,
  DatasetExportPayload,
  DatasetPayload,
  RootState
} from '@/store/types'
import { TooltipOptions } from '@/types'
import { copy as copyToClipboard, formatDate } from '@/utils'
import { DeleteExportParams } from '@/utils/backend'

import ClipboardIcon from './assets/clipboard.svg?inline'

@Component({
  name: 'dataset-export-version',
  components: { ClipboardIcon, DownloadButton, TrashIcon, TypeIcon }
})
export default class DatasetExportVersionComponent extends Vue {
  @Prop({ required: true, type: Object })
  datasetExport!: DatasetExportPayload

  @Prop({ required: true, type: String })
  datasetSlug!: string

  @Prop({ required: true, type: String })
  teamSlug!: string

  @Prop({ required: false, type: Boolean, default: false })
  isOpenMode!: boolean

  @State((state: RootState) => state.aclass.types)
  storedAnnotationTypes!: AnnotationTypePayload[]

  @State((state: RootState) =>
    state.dataset.datasets.find((d: DatasetPayload) => d.id === state.dataset.currentDataset.id)
  )
  currentDataset!: DatasetPayload

  get date (): string {
    return formatDate(this.datasetExport.inserted_at, 'DD/MM/YYYY')
  }

  get imageCount (): string {
    return this.datasetExport.metadata && this.datasetExport.metadata.num_images
      ? `${this.datasetExport.metadata.num_images} images`
      : ''
  }

  get classCount (): string {
    return this.datasetExport.metadata && this.datasetExport.metadata.annotation_classes
      ? `${this.datasetExport.metadata.annotation_classes.length} classes`
      : ''
  }

  get annotationTypes (): { stored: AnnotationTypePayload, count: number }[] {
    if (!this.datasetExport.metadata || !this.datasetExport.metadata.annotation_types) { return [] }
    const annotationTypeCounts = this.datasetExport.metadata.annotation_types
    const annotationTypeIds = annotationTypeCounts.map(annotationType => annotationType.id)
    const annotationTypes =
      this.storedAnnotationTypes
        .filter(annotationType => annotationTypeIds.includes(annotationType.id))
    return annotationTypes.map(annotationType => ({
      stored: annotationType,
      count: annotationTypeCounts.find(count => count.id === annotationType.id)!.count
    }))
  }

  get versionName (): String {
    return `${this.teamSlug}/${this.datasetSlug}:${this.datasetExport.name}`
  }

  get canDelete (): boolean {
    return this.$can('export_dataset')
  }

  get deleteTooltip (): TooltipOptions {
    if (this.canDelete) { return { content: 'Delete' } }
    return { content: "You don't have the permissions to delete data" }
  }

  async deleteVersion (): Promise<void> {
    if (!this.canDelete) { return }

    const params: DeleteExportParams = {
      datasetId: this.currentDataset.id,
      name: this.datasetExport.name
    }
    await this.$store.dispatch('dataset/deleteExport', params)
  }

  get canDownload (): boolean {
    return this.$can('view_dataset_exports') || this.isOpenMode
  }

  downloadVersion (): void {
    if (!this.canDownload) { return }
    if (this.datasetExport.download_url) { window.location.href = this.datasetExport.download_url }
  }

  async copyToClipboard (): Promise<void> {
    const value = `darwin dataset pull ${this.versionName}`
    try {
      await copyToClipboard(value)
    } catch (e: unknown) {
      const warning =
        "Couldn't copy content to clipboard. Please select the text and copy it manually."
      return this.$store.dispatch('toast/warning', { content: warning })
    }

    const notification = 'Copied Darwin CLI command to clipboard.'
    this.$store.dispatch('toast/notify', { content: notification })
  }
}
</script>

<style lang="scss" scoped>
.dataset-export {
  padding: 20px;
  padding-top: 0;
}

.dataset-export__header {
  @include row--distributed;
}

.dataset-export__header p {
  @include typography(md-1, headlines, bold);
  color: $colorSecondaryLight;
}

.dataset-export__header__title {
  @include row;
  align-items: center;
  background-color: $colorSecondaryLight2;
  padding: 10px 20px;
  border-radius: 5px 5px 0 0;
  cursor: pointer;
}

.dataset-export__header__title h1 {
  @include typography(md-1, headlines, bold);
  color: $colorSecondaryDark;
}

.dataset-export__header__title svg {
  margin-left: 12px;
}

.dataset-export__header__actions {
  flex: 1;
  @include row;
  align-items: center;
  justify-content: flex-end;
}

.dataset-export__header__trash-button {
  position: relative;
  @include row;
  align-items: center;
  width: 33px;
  height: 33px;
  padding-left: 5px;
  border-radius: 50%;
  background: transparent;
  padding: 5px;
  margin-right: 10px;

  transition: background-color .2s ease;
  transition: box-shadow .2s ease;

  &:not(.dataset-export__header__trash-button--disabled):hover {
    background: $colorSecondaryLight2;
    box-shadow: 0px 0px 4px $colorSecondaryLight2, 0px 4px 4px rgba(145, 169, 192, 0.3);
  }

  svg {
    width: 100%;
    height: 100%;
    color: $colorAliceNight;
  }
}

.dataset-export__header__trash-button--disabled {
  opacity: .3;
}

.dataset-export__header__download-button {
  position: relative;
  width: 33px;
  height: 33px;
  padding-left: 5px;
}

.dataset-export__body {
  @include row--center;
  background-color: $colorLineGrey;
  padding: 5px 20px;
  border-radius: 0 5px 5px 5px;
}

.dataset-export__body__date {
  flex: 1;
}

.dataset-export__body__image-count {
  flex: 1;
}

.dataset-export__body__class-count {
  flex: 1;
}

.dataset-export__body__type-counts {
  @include row;
  max-width: 200px;
  overflow-x: auto;
  flex: 1;
}

.dataset-export__body__type-count {
  display: flex;
  background-color: $colorSecondaryLight3;
  border-radius: 5px;
  padding: 2.5px 10px;
  margin: 2.5px;
  @include row--center;
}

.dataset-export__body__type-count__text {
  margin-left: 10px;
  @include row--center;
}
</style>
