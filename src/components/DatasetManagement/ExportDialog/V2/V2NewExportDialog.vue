<template>
  <modal-v2
    name="new-export"
    size="medium"
    height="660px"
  >
    <modal-header-v2 hide-close>
      <template #title>
        <modal-header-title-v2>Create New Export</modal-header-title-v2>
      </template>
    </modal-header-v2>
    <modal-content-v2>
      <span class="new-export__header secondary-color">
        Save a new version
      </span>
      <paragraph-14 class="content-tip secondary-color">
        Generate a version of this dataset for export or model training.
        This version acts as a snapshot and cannot be edited later,
        but you can create new versions of your dataset as you reach certain milestones.
      </paragraph-14>
      <div class="modal__form__group">
        <paragraph-14 class="secondary-color">
          Name of this version
        </paragraph-14>
        <input-field
          ref="name"
          v-model="versionName"
          class="modal__content__new__input__field"
          name="name"
          required="required"
          :auto-focus="false"
          placeholder="version-name"
          @change="slugify($event)"
          :error.sync="errors.name"
        />
      </div>
      <div class="modal__form__group">
        <paragraph-14 class="secondary-color">
          Format
        </paragraph-14>
        <v2-export-format-dropdown v-model="exportFormat" />
      </div>
      <div class="modal__form__group">
        <paragraph-14 class="secondary-color">
          Items to Export
        </paragraph-14>
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
            <radio-v2
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
      </div>

      <div class="modal__form__group">
        <paragraph-14 class="secondary-color">
          Optionally filter by class
        </paragraph-14>
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
          <check-box-v2
            v-model="includeAuthorshipToggle"
            name="includeAuthorshipToggle"
            label="Include annotator/reviewer metadata"
            size="large"
          />
          <tooltip-info
            class="modal__content__new__include-authorship__info"
            content="Include annotation authorships"
            placement="right"
          />
        </div>
        <div class="modal__content__new__include-export-token">
          <check-box-v2
            v-model="includeExportTokenToggle"
            name="includeExportTokenToggle"
            label="Include export token"
            size="large"
          />
          <tooltip-info
            class="modal__content__new__include-export-token__info"
            content="Include export token in URLs.
                     WARNING: the token can be used to access all dataset items."
            placement="right"
          />
        </div>
      </div>
    </modal-content-v2>
    <modal-footer-v2 class="footer-container">
      <custom-button
        size="medium"
        flair="rounded"
        variant="outline"
        @click="close"
      >
        Close
      </custom-button>

      <custom-button
        class="button__export"
        color="primary"
        size="medium"
        flair="rounded"
        :disabled="filteredCount === 0"
        @click="onExport"
      >
        Export {{ filteredCount | pluralize('Item', 'Items') }}
      </custom-button>
    </modal-footer-v2>
  </modal-v2>
</template>

<script lang="ts">
import VueTagsInput from '@johmun/vue-tags-input'
import { toLower } from 'lodash'
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { CustomButton } from '@/components/Common/Button/V2'
import CheckBoxV2 from '@/components/Common/CheckBox/V2/CheckBox.vue'
import Header3 from '@/components/Common/Header3.vue'
import { InputField } from '@/components/Common/InputField/V2'
import ModalV2 from '@/components/Common/Modal/V2/Modal.vue'
import ModalContentV2 from '@/components/Common/Modal/V2/ModalContent.vue'
import ModalFooterV2 from '@/components/Common/Modal/V2/ModalFooter.vue'
import ModalHeaderV2 from '@/components/Common/Modal/V2/ModalHeader.vue'
import ModalHeaderTitleV2 from '@/components/Common/Modal/V2/ModalHeaderTitle.vue'
import Paragraph14 from '@/components/Common/Paragraph14.vue'
import RadioV2, { RadioEvent } from '@/components/Common/Radio/V2/Radio.vue'
import TooltipInfo from '@/components/Common/TooltipInfo.vue'
import V2ExportFormatDropdown from '@/components/DatasetManagement/ExportDialog/V2/V2ExportFormatDropdown.vue'
import { getV2Exports } from '@/store/modules/dataset/actions/getV2Exports'
import { loadV2DatasetItemCounts } from '@/store/modules/dataset/actions/loadV2DatasetItemCounts'
import {
  ExportAnnotationFilterParams,
  ExportV2DatasetFilterParams,
  ExportV2Params
} from '@/store/modules/dataset/types'
import {
  AnnotationClassPayload,
  DatasetExportPayload,
  DatasetPayload,
  InputTag,
  TeamPayload,
  ValidationErrors,
  RootState,
  DatasetItemStatus,
  DatasetItemCountsPayload,
  StoreActionPayload,
  V2DatasetItemFilter,
  DatasetDetailPayload
} from '@/store/types'
/**
 * Used to add additional items to a dataset, from the data tab.
 */

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
  name: 'v2-new-export-dialog',
  components: {
    CheckBoxV2,
    CustomButton,
    Header3,
    InputField,
    ModalV2,
    ModalContentV2,
    ModalHeaderV2,
    ModalHeaderTitleV2,
    ModalFooterV2,
    Paragraph14,
    RadioV2,
    TooltipInfo,
    V2ExportFormatDropdown,
    VueTagsInput
  }
})
export default class V2NewExportDialog extends Vue {
  @State((state: RootState) => state.aclass.classes)
  annotationClasses!: AnnotationClassPayload[];

  @State((state: RootState) => state.dataset.datasetExports)
  datasetExports!: DatasetExportPayload[];

  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload

  @State((state: RootState) => state.dataset.datasetItemFilterV2)
  datasetItemFilter!: V2DatasetItemFilter

  @State((state: RootState) => state.dataset.selectedV2ItemIds)
  selectedItemIds!: string[]

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

  @State((state: RootState) => state.dataset.datasetDetails)
  datasetDetails!: DatasetDetailPayload[]

  classTags: InputTag[] = []
  classTag = ''
  exportFormat = 'json'
  versionName = ''
  errors: ValidationErrors = {}

  imageStatusSelection: ImageStatusSelection[] = [
    {
      id: 1,
      selected: true,
      value: '1',
      name: 'all_complete',
      label: 'All Complete (Recommended)',
      tooltip: 'Include only items marked as "Complete" (those that passed review)',
      disabledTooltip: 'No items have been completed yet'
    },
    {
      id: 2,
      selected: false,
      value: '2',
      name: 'current_filters',
      label: 'Current filters',
      tooltip: 'Include only items that matches the filters'
    },
    {
      id: 3,
      selected: false,
      value: '3',
      name: 'selected',
      label: 'Selected',
      tooltip: 'Include only selected items',
      disabledTooltip: 'Select one or more items before clicking on Export to enable this option'
    }
  ]

  includeAuthorshipToggle: boolean = false
  includeExportTokenToggle: boolean = false

  get filteredClasses (): { text: string }[] {
    return this.annotationClasses
      .filter(klass => klass.name.toLowerCase().indexOf(this.classTag.toLowerCase()) !== -1)
      .map(annotationClass => ({ text: annotationClass.name }))
  }

  classTagsChanged (newTags: InputTag[]): void {
    this.classTags = newTags
  }

  onNewTag (object: {tag: InputTag, addTag: () => void}): void {
    if (object.tag.tiClasses && object.tag.tiClasses!.includes('ti-duplicate')) {
      this.classTag = ''
      return
    }

    const annotationClassNames =
      this.annotationClasses.map(annotationClass => annotationClass.name.toLowerCase())
    if (!annotationClassNames.includes(object.tag.text.toLowerCase())) { return }

    const annotationClass = this.annotationClasses.find(annotationClass =>
      annotationClass.name.toLowerCase() === object.tag.text.toLowerCase()
    )

    object.tag.style = `background: ${annotationClass!.metadata._color}`
    this.classTag = ''
    object.addTag()
  }

  get datasetDetail (): DatasetDetailPayload | undefined {
    return this.datasetDetails.find(d => d.id === this.dataset.id)
  }

  filteredCounts (imageStatusName: ImageStatusName): number | 'N/A' {
    switch (imageStatusName) {
    case 'all_complete':
      return this.datasetDetail?.status_counts.find(c => c.status === 'complete')?.count || 0
    case 'current_filters': {
      const { datasetCounts } = this
      return datasetCounts ? datasetCounts.item_count : 'N/A'
    }
    case 'selected':
      return this.selectedItemIds.length
    }
  }

  get filteredCount (): number | 'N/A' {
    return this.filteredCounts(this.selectedImageStatus.name)
  }

  async fetchCompletedDatasetItemCounts (): Promise<void> {
    const datasetId = this.dataset.id
    if (!datasetId) { return }
    const payload: StoreActionPayload<typeof loadV2DatasetItemCounts> = { dataset: this.dataset }
    await this.$store.dispatch('dataset/loadV2DatasetItemCounts', payload)
  }

  slugify (val: string): void {
    this.versionName = toLower(val).replace(' ', '-').replace(/[^a-z0-9-.]/g, '')
  }

  validate (): { valid: boolean, errors: ValidationErrors } {
    const errors: ValidationErrors = {}
    if (this.versionName === '') { errors.name = 'You must type in a name.' }
    return { errors, valid: Object.keys(errors).length === 0 }
  }

  show (): void {
    this.versionName = ''
    this.errors = {}

    this.fetchCompletedDatasetItemCounts()
    this.$modal.show('new-export')
  }

  close (): void {
    this.$modal.hide('new-export')
  }

  onExport (): void {
    if (!this.dataset.id) { return }

    this.errors = {}
    const { errors } = this.validate()
    this.errors = errors
    if (this.errors.name) { return }

    const annotationClassIds = this.classTags.map(classTag =>
      this.annotationClasses.find(annotationClass => annotationClass.name === classTag.text)!.id
    )

    const annotationFilter: ExportAnnotationFilterParams = {}
    if (annotationClassIds.length > 0) {
      annotationFilter.annotation_class_ids = annotationClassIds
    }

    this.exportDataset({
      annotationFilter,
      datasetSlug: this.dataset.slug,
      format: this.exportFormat.toLowerCase(),
      filters: this.filter,
      includeAuthorship: this.includeAuthorshipToggle,
      includeExportToken: this.includeExportTokenToggle,
      name: this.versionName,
      teamSlug: this.dataset.team_slug
    })
  }

  async exportDataset (params: ExportV2Params): Promise<void> {
    const response = await this.$store.dispatch('dataset/exportV2Dataset', params)
    if (response.error) {
      if (response.error.isValidationError) {
        this.errors = {}
        this.errors.name = response.error.name
      }
      return
    }
    this.close()

    const title =
      "Your dataset is being exported. You and your team members will be notified when it's ready."

    this.$toast.info({ meta: { title } })
    this.fetchDatasetExports()

    this.pollNewResults()
  }

  async fetchDatasetExports () {
    if (this.dataset.version === 2) {
      const payload: StoreActionPayload<typeof getV2Exports> = {
        datasetSlug: this.dataset.slug,
        teamSlug: this.dataset.team_slug
      }
      return await this.$store.dispatch('dataset/getV2Exports', payload)
    }
    return await this.$store.dispatch('dataset/getDatasetExports', { datasetId: this.dataset.id })
  }

  /*
  * Since the user can only export once in a specific time range it is safe to poll until
  * the results data last item in array has a download url.
  *
  * Covered biggest known edge-case - if the last export is still generating while the user still
  * created an new export the last data array item will simply override it later.
  * */
  pollNewResults (): void {
    // backup if something went wrong on backend, or host
    let retryCount: number = 0

    const pollInterval = setInterval(async () => {
      const { data, error } = await this.fetchDatasetExports()
      retryCount += 1

      if (retryCount === 6) { // 64s on second retry
        clearInterval(pollInterval)
      }

      if (!error && data[data.length - 1].download_url) {
        clearInterval(pollInterval)
      }

      clearInterval(pollInterval)
    }, (Math.pow(2, retryCount) * 1000)) // exponential retry in ms [1000, 2000, 4000, 8000, ...]
  }

  selectImageStatus (event: RadioEvent): void {
    for (const selection of this.imageStatusSelection) {
      selection.selected = false
    }
    const id = event.id as number
    this.imageStatusSelection[id - 1].selected = true
  }

  get selectedImageStatus (): ImageStatusSelection {
    return this.imageStatusSelection.find(selection => selection.selected) ||
      this.imageStatusSelection[0]
  }

  get shouldDisplayNewVersion (): boolean {
    return !!this.currentTeam || !this.dataset.public
  }

  isRadioDisabled (imageStatusSelection: ImageStatusSelection): boolean {
    return imageStatusSelection.name !== 'all_complete' &&
      this.filteredCounts(imageStatusSelection.name) === 0
  }

  get isDatasetItemized (): boolean {
    return this.dataset.version === 2
  }

  get filter (): ExportV2DatasetFilterParams {
    const { page, sort, ...rest } = this.datasetItemFilter
    const { name } = this.selectedImageStatus

    if (name !== 'current_filters' && name !== 'selected') {
      return { statuses: [DatasetItemStatus.complete] }
    }

    if (name === 'selected') {
      // If you have selected all items,
      // instead of sending dataset item ids, we need to send the current filter
      return { item_ids: this.selectedItemIds }
    }

    return rest
  }
}
</script>

<style lang="scss" scoped>
:deep(.check-box) {
  width: auto;
  margin-right: 10px;
}
.new-export__header {
  @include typography(xl, inter, bold);
}
.secondary-color {
  color: $colorContentSecondary;
}

.content-tip {
  margin-top: 8px;
}

.modal__form__group {
  width: 100%;
  margin-top: 16px;
}

.modal__content__new__include-authorship, .modal__content__new__include-export-token {
  display: flex;
  margin-top: 8px;
}

.modal__content__new__status {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.modal__content__new__status__info {
  margin-left: 10px;
}

.footer-container {
  display: flex;
  justify-content: flex-end;
}
</style>
