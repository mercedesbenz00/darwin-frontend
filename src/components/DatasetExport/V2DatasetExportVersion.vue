<template>
  <div class="dataset-export">
    <div class="dataset-export__version__status">
      <div class="dataset-export__version__status-line" />
      <div
        class="dataset-export__version__status-option"
      >
        <div
          v-if="datasetExport.latest"
          class="dataset-export__version__status-option--selected"
        />
      </div>
    </div>
    <div class="dataset-export__row">
      <div
        class="dataset-export__row__title"
      >
        <h1>{{ exportName }}</h1>
      </div>

      <div class="dataset-export__body__date">
        <icon-duotone-calendar />
        <p>{{ date }}</p>
      </div>
      <div class="dataset-export__body__image-count">
        <icon-duotone-image v-if="imageCount.length > 0" />
        <p>{{ imageCount }}</p>
      </div>
      <div class="dataset-export__body__class-count">
        <p>{{ classCount }}</p>
      </div>
      <div class="dataset-export__body__type-counts">
        <div
          v-for="type in annotationTypes"
          :key="type.stored.id"
          class="dataset-export__body__type-count"
        >
          <type-icon
            class="class-distribution-table__class__name__icon"
            :type="type.stored.name"
          />
          <div class="dataset-export__body__type-count__text">
            {{ type.count }}
          </div>
        </div>
      </div>
      <div class="dataset-export__row__actions">
        <button
          v-if="datasetExport.download_url"
          v-tooltip="downloadTooltip"
          class="dataset-export__row__action-button download-icon-button"
          :disabled="!canDownload"
          :class="{
            'dataset-export__row__action-button--disabled': !canDownload
          }"
          @click="downloadVersion"
        >
          <icon-mono-download />
        </button>
        <custom-button
          v-else
          size="medium"
          flair="rounded"
          variant="default"
          tag="div"
        >
          Generating
          <template #suffix-icon>
            <div class="waiting-spinner" />
          </template>
        </custom-button>
        <button
          v-tooltip="copyCommandtooltip"
          class="dataset-export__row__action-button"
          @click="copyToClipboard"
        >
          <icon-mono-copy />
        </button>
        <button
          v-if="!isOpenMode"
          v-tooltip="deleteTooltip"
          class="dataset-export__row__action-button trash-icon-button"
          :class="{
            'dataset-export__row__action-button--disabled': !canDelete
          }"
          @click="deleteVersion"
        >
          <icon-duotone-trash />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import {
  IconDuotoneCalendar,
  IconDuotoneImage,
  IconDuotoneTrash
} from '@/assets/icons/V2/Duotone'
import {
  IconMonoCopy,
  IconMonoDownload
} from '@/assets/icons/V2/Mono'
import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'
import { CustomButton } from '@/components/Common/Button/V2'
import { deleteV2Export } from '@/store/modules/dataset/actions/deleteV2Export'
import {
  AnnotationTypePayload,
  DatasetExportPayload,
  DatasetPayload,
  RootState,
  StoreActionPayload
} from '@/store/types'
import { TooltipOptions } from '@/types'
import { copy as copyToClipboard, formatDate } from '@/utils'

@Component({
  name: 'v2-dataset-export-version',
  components: {
    CustomButton,
    IconDuotoneCalendar,
    IconDuotoneImage,
    IconDuotoneTrash,
    IconMonoCopy,
    IconMonoDownload,
    TypeIcon
  }
})
export default class V2DatasetExportVersionComponent extends Vue {
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
      ? `${this.datasetExport.metadata.num_images}`
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

  get versionName (): string {
    return `${this.teamSlug}/${this.datasetSlug}:${this.datasetExport.name}`
  }

  get exportName (): string {
    return `${this.datasetExport.name}`
  }

  get canDelete (): boolean {
    return this.$can('export_dataset')
  }

  get copyCommandtooltip (): TooltipOptions {
    return { content: 'Copy Darwin CLI command' }
  }

  get deleteTooltip (): TooltipOptions {
    if (this.canDelete) { return { content: 'Delete' } }
    return { content: "You don't have the permissions to delete data" }
  }

  get downloadTooltip (): TooltipOptions {
    return { content: 'Download' }
  }

  async deleteVersion (): Promise<void> {
    if (!this.canDelete) { return }

    const params: StoreActionPayload<typeof deleteV2Export> = {
      datasetSlug: this.currentDataset.slug,
      name: this.datasetExport.name,
      teamSlug: this.currentDataset.team_slug
    }
    await this.$store.dispatch('dataset/deleteV2Export', params)
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
  padding: 12px 0;
  position: relative;
}

.dataset-export__row {
  @include row;
  align-items: center;
}

.dataset-export__version__status {
  width: 44px;
  height: 100%;
  position: absolute;
  text-align: center;
  align-items: center;
  margin-top: -12px;
}

.dataset-export__version__status-line {
  width: 1px;
  height: 100%;
  background-color: $colorBorder;
  display: inline-block;
}

.dataset-export__version__status-option {
  display: inline-block;
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid $colorBorder;
  transform: translate(-50%, -50%);
  background: white;
}

.dataset-export__version__status-option--selected {
  display: inline-block;
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid $colorBorder;
  transform: translate(-50%, -50%);
  background: $colorStatusInformative;
}

.dataset-export p {
  @include typography(md, inter, 500);
  color: $colorContentEmphasis;
}

.dataset-export__row__title {
  @include row;
  margin-left: 44px;
  width: 128px;
}

.dataset-export__row__title h1 {
  @include typography(md-1, inter, 500);
  color: $colorContentEmphasis;
  white-space: nowrap;
  overflow: auto;
}

.dataset-export__row__title button {
  cursor: pointer;
  flex-shrink: 0;
  margin-right: 8px;
  margin-left: auto;
}

.dataset-export__row__actions {
  @include row;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding-right: 4px;
  margin-left: auto;
}

.dataset-export__row__action-button {
  position: relative;
  @include row;
  align-items: center;
  background: transparent;
  padding: 4px;
  border-radius: 6px;

  transition: background-color .2s ease;
  transition: box-shadow .2s ease;

  svg {
    width: 100%;
    height: 100%;
  }

  &:not(.dataset-export__row__action-button--disabled):hover {
    background: $colorIconButtonHover;
  }
  &:not(.dataset-export__row__action-button--disabled):active {
    background: $colorIconButtonPressed;
  }
}

.dataset-export__row__action-button--disabled {
  svg {
      color: $iconColor;
  }
}

.dataset-export__body__date {
  @include row--center;
  gap: 4px;
  margin-left: 12px;
  margin-right: 12px;
}

.dataset-export__body__image-count {
  @include row--center;
  gap: 4px;
  margin-left: 12px;
  margin-right: 12px;
}

.dataset-export__body__class-count {
  margin-left: 12px;
  margin-right: 12px;
}

.dataset-export__body__type-counts {
  @include row;
  max-width: 272px;
  overflow-x: auto;
  flex: 1;
  margin-right: 12px;
}

.dataset-export__body__type-count {
  display: flex;
  margin: 4px;
  @include row--center;
}

.class-distribution-table__class__name__icon {
  width: 16px;
  --first-color: #3D588F!important;
  --second-color: #C1CFEB!important;
}

.dataset-export__body__type-count__text {
  margin-left: 4px;
  @include row--center;
  @include typography(md, inter, 500);
  color: $colorBlue50;
}

.waiting-spinner {
  border: 2px solid $colorIconButtonDefault;
  border-radius: 50%;
  border-top: 2px solid $iconColor;
  width: 16px;
  height: 16px;
  margin-left: 4px;
  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;
}

/* Safari */
@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
