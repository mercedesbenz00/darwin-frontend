<template>
  <modal
    name="export"
    translate="pop-out"
    :min-width="350"
    :max-width="600"
    :min-height="500"
    :max-height="900"
    width="60%"
    height="90%"
    :classes="['export-modal']"
    :click-to-close="false"
    :scrollable="true"
  >
    <div class="modal__content">
      <p class="modal__content__title">
        Export Dataset
      </p>
      <div class="export-modal__content">
        <div class="modal__content__section modal__content__available-versions">
          <h2>Available versions</h2>
          <dataset-export-version
            v-for="datasetExport in availableExports"
            :key="datasetExport.version"
            :dataset-export="datasetExport"
            :dataset-slug="dataset.slug"
            :team-slug="dataset.team_slug"
            :is-open-mode="isOpenMode"
          />
        </div>
        <div
          v-if="shouldDisplayNewVersion"
          class="modal__content__section modal__content__new"
        >
          <h2>Save a new version</h2>
          <p>
            Generate a version of this dataset for export or model training.
            This version acts as a snapshot and cannot be edited later,
            but you can create new versions of your dataset as you reach certain milestones.
          </p>
          <div class="modal__content__new__input">
            <input-field
              ref="name"
              v-model="versionName"
              class="modal__content__new__input__field"
              name="name"
              label="Name of this version"
              required="required"
              :auto-focus="false"
              placeholder="version-name"
              @change="slugify($event)"
            />
          </div>
          <div class="modal__content__new__format-label">
            <label>Format</label>
          </div>
          <div class="modal__content__new__format">
            <export-format-dropdown v-model="exportFormat" />
          </div>
          <div class="modal__content__new__status-label">
            <label>Image Status</label>
          </div>
          <div
            v-for="selection in imageStatusSelection"
            :key="selection.id"
            class="modal__content__new__status"
          >
            <div
              v-tooltip="isRadioDisabled(selection)
                ? { content: selection.disabledTooltip }
                : undefined
              "
            >
              <radio
                :id="selection.id"
                class="modal__content__new__status__radio"
                :class="`modal__content__new__status__radio__${selection.name}`"
                :name="selection.name"
                :value="selection.value"
                :label="selection.label"
                :selected="selection.selected"
                :disabled="isRadioDisabled(selection)"
                @input="selectImageStatus($event)"
              />
            </div>
            <tooltip-info
              class="modal__content__new__status__info"
              :content="selection.tooltip"
              placement="right"
            />
          </div>
          <div class="modal__content__new__filter-label">
            <label>Optionally filter by class</label>
          </div>
          <div class="modal__content__new__filter">
            <vue-tags-input
              ref="classTagInput"
              v-model="classTag"
              :tags="classTags"
              :autocomplete-items="filteredClasses"
              avoid-adding-duplicates
              placeholder="Type in an annotation class name"
              :delete-on-backspace="true"
              :add-only-from-autocomplete="true"
              @tags-changed="classTagsChanged"
              @before-adding-tag="onNewTag"
            />
          </div>
          <div class="modal__content__new__include-authorship">
            <check-box
              v-model="includeAuthorshipToggle"
              name="includeAuthorshipToggle"
              label="Include annotator/reviewer metadata"
            />
            <tooltip-info
              class="modal__content__new__include-authorship__info"
              content="Include annotation authorships"
              placement="right"
            />
          </div>
          <div class="modal__content__new__include-export-token">
            <check-box
              v-model="includeExportTokenToggle"
              name="includeExportTokenToggle"
              label="Include export token"
            />
            <tooltip-info
              class="modal__content__new__include-export-token__info"
              content="Include export token in URLs.
                       WARNING: the token can be used to access all dataset images and videos."
              placement="right"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="modal__footer export-modal__footer">
      <secondary-button
        class="button__close"
        @click="close"
      >
        Close
      </secondary-button>
      <positive-button
        v-if="shouldDisplayNewVersion"
        class="button__export"
        :disabled="filteredCount === 0"
        @click="onExport"
      >
        EXPORT {{ filteredCount | pluralize('ITEM', 'ITEMS') }}
      </positive-button>
    </div>
  </modal>
</template>

<script lang="ts">
import VueTagsInput from '@johmun/vue-tags-input'
import { toLower } from 'lodash'
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import Radio, { RadioEvent } from '@/components/Common/Radio.vue'
import TooltipInfo from '@/components/Common/TooltipInfo.vue'
import DatasetExportVersion from '@/components/DatasetExport/DatasetExportVersion.vue'
import { getExportCompleteCount } from '@/store/modules/dataset/actions/getExportCompleteCount'
import {
  ExportAnnotationFilterParams,
  ExportDatasetFilterParams,
  ExportDatasetParams
} from '@/store/modules/dataset/types'
import {
  AnnotationClassPayload,
  DatasetExportPayload,
  DatasetPayload,
  InputTag,
  TeamPayload,
  ValidationErrors,
  DatasetItemPayload,
  DatasetItemFilter,
  RootState,
  DatasetItemStatus,
  DatasetItemCountsPayload,
  StoreActionPayload
} from '@/store/types'

import ExportFormatDropdown from './ExportFormatDropdown.vue'

type ImageStatusName = 'all_complete' | 'current_filters' | 'selected'

type ImageStatusSelection = {
  id: number
  selected: boolean
  value: string
  label: string
  name: ImageStatusName
  tooltip: string
  disabledTooltip?: string
}

@Component({
  name: 'export-dialog',
  components: {
    CheckBox,
    DatasetExportVersion,
    ExportFormatDropdown,
    InputField,
    Radio,
    TooltipInfo,
    VueTagsInput
  }
})
export default class ExportDialog extends Vue {
  @Prop({ required: false, type: Boolean, default: false })
  isOpenMode!: boolean

  @State((state: RootState) => state.aclass.classes)
  annotationClasses!: AnnotationClassPayload[];

  @State((state: RootState) => state.dataset.datasetExports)
  datasetExports!: DatasetExportPayload[];

  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload

  @State((state: RootState) => state.dataset.datasetItems)
  datasetItems!: DatasetItemPayload[]

  @State((state: RootState) => state.dataset.datasetItemFilter)
  datasetItemFilter!: DatasetItemFilter

  @State((state: RootState) => state.dataset.folderEnabled)
  foldersEnabled!: boolean

  @State((state: RootState) => state.dataset.selectedItemIds)
  selectedItemIds!: number[]

  @State((state: RootState) => state.dataset.datasets.find(
    (d: DatasetPayload) => d.id === state.dataset.currentDataset.id)
  )
  dataset!: DatasetPayload

  @State((state: RootState) =>
    state.dataset.datasetDetails.find(d => d.id === state.dataset.currentDataset.id)
  )
  datasetCounts!: DatasetItemCountsPayload

  @State((state: RootState) => state.dataset.exportCompleteCount)
  exportCompleteCount!: number

  classTags: InputTag[] = []
  classTag = ''
  exportFormat = 'json'
  versionName = ''
  errors: ValidationErrors = {}

  $refs!: Vue['$refs'] & {
    name: InputField
  }

  imageStatusSelection: ImageStatusSelection[] = [
    {
      id: 1,
      selected: true,
      value: '1',
      name: 'all_complete',
      label: 'All Complete (Recommended)',
      tooltip: 'Include only images marked as "Complete" (those that passed review)',
      disabledTooltip: 'No images have been completed yet'
    },
    {
      id: 2,
      selected: false,
      value: '2',
      name: 'current_filters',
      label: 'Current filters',
      tooltip: 'Include only images that matches the filters'
    },
    {
      id: 3,
      selected: false,
      value: '3',
      name: 'selected',
      label: 'Selected',
      tooltip: 'Include only selected images',
      disabledTooltip: 'Select one or more items before clicking on Export to enable this option'
    }
  ]

  includeAuthorshipToggle: boolean = false
  includeExportTokenToggle: boolean = false

  get availableExports () {
    const datasetExports = this.datasetExports || []
    return datasetExports
      .filter((datasetExport: DatasetExportPayload) => datasetExport.version !== null)
      .reverse()
  }

  get filteredClasses () {
    return this.annotationClasses
      .filter(
        annotationClass =>
          annotationClass.name.toLowerCase().indexOf(this.classTag.toLowerCase()) !== -1
      )
      .map(annotationClass => ({ text: annotationClass.name }))
  }

  classTagsChanged (newTags: InputTag[]) {
    this.classTags = newTags
  }

  onNewTag (object: {tag: InputTag, addTag: () => void}) {
    if (object.tag.tiClasses && object.tag.tiClasses!.includes('ti-duplicate')) {
      this.classTag = ''
      return
    }

    const annotationClassNames = this.annotationClasses.map(c => c.name.toLowerCase())
    if (!annotationClassNames.includes(object.tag.text.toLowerCase())) { return }

    const annotationClass = this.annotationClasses.find(annotationClass =>
      annotationClass.name.toLowerCase() === object.tag.text.toLowerCase()
    )

    object.tag.style = `background: ${annotationClass!.metadata._color}`
    this.classTag = ''
    object.addTag()
  }

  filteredCounts (imageStatusName: ImageStatusName): number | 'N/A' {
    switch (imageStatusName) {
    case 'all_complete':
      return this.exportCompleteCount
    case 'current_filters': {
      const { datasetCounts } = this
      return datasetCounts ? datasetCounts.item_count : 'N/A'
    }
    case 'selected':
      return this.selectedItemIds.length
    }
  }

  get filteredCount () {
    return this.filteredCounts(this.selectedImageStatus.name)
  }

  async fetchDatasetExports () {
    const datasetId = this.dataset.id
    if (!datasetId) { return }
    await this.$store.dispatch('dataset/getDatasetExports', { datasetId })
  }

  async fetchCompletedDatasetItemCounts () {
    const datasetId = this.dataset.id
    if (!datasetId) { return }
    const payload: StoreActionPayload<typeof getExportCompleteCount> = {
      datasetSlug: this.dataset.slug,
      teamSlug: this.dataset.team_slug
    }
    await this.$store.dispatch('dataset/getExportCompleteCount', payload)
  }

  slugify (val: string) {
    this.versionName = toLower(val).replace(' ', '-').replace(/[^a-z0-9-.]/g, '')
  }

  validate (): { valid: boolean, errors: ValidationErrors } {
    const errors: ValidationErrors = {}
    if (this.versionName === '') { errors.name = 'You must type in a name.' }
    return { errors, valid: Object.keys(errors).length === 0 }
  }

  @Watch('errors')
  onErrors (errors: ValidationErrors): void {
    if (errors.name) { this.$refs.name.setError(errors.name as string) }
  }

  show () {
    this.versionName = ''
    this.errors = {}

    this.fetchDatasetExports()
    this.fetchCompletedDatasetItemCounts()
    this.$modal.show('export')
  }

  close () {
    this.$modal.hide('export')
    this.$store.dispatch('ui/bringFrontSidebar')
    if (this.$route.query.export) {
      this.$router.push({ query: { ...this.$route.query, export: undefined } })
    }
  }

  onExport () {
    if (!this.dataset.id) { return }

    this.errors = {}
    const { errors } = this.validate()
    this.errors = errors
    if (this.errors.name) { return }

    const annotationClassIds = this.classTags.map(classTag =>
      this.annotationClasses.find(annotationClass => annotationClass.name === classTag.text)!.id
    )

    let filter: ExportDatasetFilterParams = {}
    if (this.selectedImageStatus.name === 'current_filters') {
      const { page, sort, path, ...rest } = this.datasetItemFilter
      // HOTFIX for exports sometimes failing when folders enabled
      // Without this, `path: '/'` is always added to the export filter
      // resulting in the export failing with nothing to export, in a dataset
      // where everything is in folders and folders are currently disabled
      // This should be revisited once generic filters are added
      filter = this.foldersEnabled ? { ...rest, path } : rest
    } else if (this.selectedImageStatus.name === 'selected') {
      // If you have selected all items,
      // instead of sending dataset item ids, we need to send the current filter
      if (this.datasetItems.length !== this.selectedItemIds.length) {
        filter.dataset_item_ids = this.selectedItemIds
      } else {
        const { page, sort, path, ...rest } = this.datasetItemFilter
        filter = this.foldersEnabled ? { ...rest, path } : rest
      }
    } else {
      filter.statuses = [DatasetItemStatus.complete]
    }

    const annotationFilter: ExportAnnotationFilterParams = {}
    if (annotationClassIds.length > 0) {
      annotationFilter.annotation_class_ids = annotationClassIds
    }

    this.exportDataset({
      annotationFilter,
      datasetId: this.dataset.id,
      format: this.exportFormat.toLowerCase(),
      filter,
      includeAuthorship: this.includeAuthorshipToggle,
      includeExportToken: this.includeExportTokenToggle,
      name: this.versionName
    })
  }

  async exportDataset (params: ExportDatasetParams) {
    const response = await this.$store.dispatch('dataset/exportDataset', params)
    if (response.error) {
      if (response.error.isValidationError) {
        this.errors = {}
        this.errors.name = response.error.name
      }
      return
    }

    this.close()
    this.$store.dispatch('toast/notify', {
      content: [
        'Your dataset is being exported',
        "You and your team members will be notified when it's ready."
      ].join(' ')
    })
    this.$store.dispatch('ui/bringFrontSidebar')
  }

  /**
   * Show export dialog if route query contains a "export" key
   */
  @Watch('$route.query.export', { immediate: true })
  onExportRoute () {
    if (this.$route?.query?.export) { this.show() }
  }

  selectImageStatus (event: RadioEvent) {
    for (const selection of this.imageStatusSelection) {
      selection.selected = false
    }
    const id = event.id as number
    this.imageStatusSelection[id - 1].selected = true
  }

  get selectedImageStatus () {
    return this.imageStatusSelection.find(selection => selection.selected) ||
      this.imageStatusSelection[0]
  }

  get shouldDisplayNewVersion () {
    return this.currentTeam || !this.dataset.public
  }

  isRadioDisabled (imageStatusSelection: ImageStatusSelection) {
    return imageStatusSelection.name !== 'all_complete' &&
      this.filteredCounts(imageStatusSelection.name) === 0
  }
}
</script>

<style lang="scss" scoped>
.export-modal {
  border-radius: 5px;
  box-shadow: 0px 10px 20px rgba(145, 169, 192, 0.3);
}

.modal__content {
  background-color: $colorLineGrey;
  padding: 0;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  max-height: calc(100% - 80px);
}

.modal__content__title {
  @include typography(xl, headlines, bold);
  padding: 30px 45px 20px;
  letter-spacing: 0.01em;
  color: $color90Black;
  text-align: left;
}

.export-modal__content {
  margin: 10px 40px;
}

.modal__content__section {
  background-color: $colorAliceBlue;
  border-radius: 5px;
  margin-top: 0;
  margin-bottom: 20px;
}

.modal__content__section h2 {
  @include typography(lg-1, headlines, bold);
  color: $colorBlack;
  padding: 20px;
}

.modal__content__section p {
  @include typography(md-1, default);
  color: $colorBlack;
  padding: 20px;
  padding-top: 0;
}

.modal__content__new__input,
.modal__content__new__format,
.modal__content__new__filter,
.modal__content__new__status {
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 10px;
}

.modal__content__new__include-authorship, .modal__content__new__include-export-token {
  display: flex;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 20px;
}

:deep(.check-box) {
  width: auto;
  margin-right: 10px;
}

:deep(.modal__content__new__include-authorship) .check-box__label__text {
  font-size: 0.75rem;
  line-height: 1rem;
  color: $color90Black;
}

:deep(.modal__content__new__include-export-token) .check-box__label__text {
  font-size: 0.75rem;
  line-height: 1rem;
  color: $color90Black;
}

.modal__content__new__status {
  display: flex;
  align-items: center;
}

:deep(.modal__content__new__status__radio) .radio__title {
  color: $color90Black;
}

.modal__content__new__status__info {
  margin-left: 10px;
}

.modal__content__new__filter-label,
.modal__content__new__format-label,
.modal__content__new__status-label {
  @include typography(md-1, default);
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 6px;
}

.modal__content__new__filter-label label, .modal__content__new__format-label label, .modal__content__new__status-label label {
  @include typography(md-1, default);
  color: $colorAliceNight;
}

.export-modal__footer {
  @include row--right;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 0 0 5px 5px;
}

.button__close,
.button__export {
  flex: 0.3;
  margin: 0 10px;
  width: 50px;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style src='@/components/DatasetManagement/ExportDialog/tags.scss' lang="scss"></style>
