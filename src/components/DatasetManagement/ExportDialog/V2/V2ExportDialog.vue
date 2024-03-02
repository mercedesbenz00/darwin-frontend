<template>
  <modal-v2
    name="export"
    size="large"
    :min-width="350"
    :max-width="800"
    :min-height="500"
    :max-height="768"
    height="85%"
    :scrollable="true"
  >
    <modal-header-v2
      @close="close"
      hide-close
    >
      <template #title>
        <modal-header-title-v2>Export Dataset</modal-header-title-v2>
      </template>
    </modal-header-v2>
    <modal-content-v2>
      <citation-info
        v-if="shouldDisplayCitation"
        :dataset="dataset"
      />
      <div class="modal__content__available-versions">
        <label class="modal__content__label">Available Versions</label>
        <span class="version-count">{{ availableExports.length }}</span>
        <icon-button
          v-if="shouldDisplayNewVersion"
          class="version-new__button"
          size="small"
          flair="rounded"
          variant="default"
          @click="addExport"
        >
          <span class="plus-icon">+</span>
        </icon-button>
        <v2-dataset-export-version-list
          class="version-list"
          :available-exports="availableExports"
          :dataset="dataset"
          :is-open-mode="isOpenMode"
        >
          <template #version-list-empty>
            <span>You haven't created any exports yet.</span>
            <custom-button
              v-if="shouldDisplayNewVersion"
              class="version__list__btn"
              size="medium"
              flair="rounded"
              variant="default"
              @click="addExport"
            >
              + Create Export
            </custom-button>
            <div class="dataset-export__version__status">
              <div class="dataset-export__version__status-line" />
              <div
                class="dataset-export__version__status-option"
              >
                <div
                  class="dataset-export__version__status-option--selected"
                />
              </div>
            </div>
          </template>
        </v2-dataset-export-version-list>
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
        v-if="shouldDisplayNewVersion"
        color="primary"
        size="medium"
        flair="rounded"
        @click="addExport"
      >
        + Create Export
      </custom-button>
    </modal-footer-v2>
  </modal-v2>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { CustomButton, IconButton } from '@/components/Common/Button/V2'
import ModalV2 from '@/components/Common/Modal/V2/Modal.vue'
import ModalContentV2 from '@/components/Common/Modal/V2/ModalContent.vue'
import ModalFooterV2 from '@/components/Common/Modal/V2/ModalFooter.vue'
import ModalHeaderV2 from '@/components/Common/Modal/V2/ModalHeader.vue'
import ModalHeaderTitleV2 from '@/components/Common/Modal/V2/ModalHeaderTitle.vue'
import V2DatasetExportVersionList from '@/components/DatasetExport/V2DatasetExportVersionList.vue'
import CitationInfo from '@/components/DatasetManagement/Common/CitationInfo/CitationInfo.vue'
import {
  DatasetExportPayload,
  DatasetPayload,
  TeamPayload,
  UserPayload,
  RootState
} from '@/store/types'

@Component({
  name: 'v2-export-dialog',
  components: {
    CitationInfo,
    CustomButton,
    IconButton,
    ModalV2,
    ModalContentV2,
    ModalHeaderV2,
    ModalHeaderTitleV2,
    ModalFooterV2,
    V2DatasetExportVersionList
  }
})
export default class V2ExportDialog extends Vue {
  @Prop({ required: false, type: Boolean, default: false })
  isOpenMode!: boolean

  @State((state: RootState) => state.dataset.datasetExports)
  datasetExports!: DatasetExportPayload[];

  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload

  @State(state => state.user.profile)
  user!: UserPayload

  @State((state: RootState) => state.dataset.datasets.find(
    (d: DatasetPayload) => d.id === state.dataset.currentDataset.id)
  )
  dataset!: DatasetPayload

  get availableExports () {
    const datasetExports = this.datasetExports || []
    return datasetExports
      .filter((datasetExport: DatasetExportPayload) => datasetExport.version !== null)
      .reverse()
  }

  async fetchDatasetExports () {
    const { id, slug: datasetSlug, team_slug: teamSlug } = this.dataset
    if (!id) { return }
    await this.$store.dispatch('dataset/getV2Exports', { datasetSlug, teamSlug })
  }

  addExport () {
    this.$emit('createExport')
  }

  show () {
    this.fetchDatasetExports()
    this.$modal.show('export')
  }

  close () {
    this.$modal.hide('export')
    this.$store.dispatch('ui/bringFrontSidebar')
    if (this.$route.query.export) {
      this.$router.push({ query: { ...this.$route.query, export: undefined } })
    }
  }

  /**
   * Show export dialog if route query contains a "export" key
   */
  @Watch('$route.query.export', { immediate: true })
  onExportRoute () {
    if (this.$route?.query?.export) { this.show() }
  }

  get isAuthorizedUser (): boolean {
    return !!this.user
  }

  get shouldDisplayNewVersion () {
    return this.currentTeam || !this.dataset.public
  }

  get shouldDisplayCitation (): boolean {
    return !this.isAuthorizedUser || this.dataset.public
  }
}
</script>

<style lang="scss" scoped>
.modal__content__label {
  color: $colorContentSecondary;
  @include typography(md-1, inter);
}

.version-list {
  margin-top: 16px;
  position: relative;
}

.modal__content__available-versions {
  width: 100%;
}

.version-count {
  padding:2px 4px;
  border-radius: 4px;
  margin-left: 4px;
  color: $colorContentSecondary;
  background-color: $colorGray20;
  @include typography(md-1, inter);
}

.version__list__btn {
  margin-top: 8px;
}

.version-new__button {
  float: right;
  margin-top: -8px;
}

.plus-icon {
  font-size: 20px;
}

.dataset-export__version__status {
  width: 44px;
  height: 44px;
  position: absolute;
  text-align: center;
  align-items: center;
  bottom: 0px;
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
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid $colorBorder;
  transform: translate(-50%, -50%);
  background: white;
}

.dataset-export__version__status-option--selected {
  display: inline-block;
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid $colorBorder;
  transform: translate(-50%, -50%);
  background: $colorStatusInformative;
}

.footer-container {
  display: flex;
  justify-content: flex-end;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style src='../tags.scss' lang="scss"></style>
