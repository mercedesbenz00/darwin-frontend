<template>
  <div
    class="dataset-create"
    :class="{ 'dataset-create--v2': !showAnnotationStep }"
  >
    <div class="dataset-create__header">
      <bread-crumbs />
      <div class="dataset-create__buttons">
        <button
          v-if="uploadInProgress"
          class="dataset-create__cancel-upload"
          @click="cancelUpload"
        >
          Cancel Upload
        </button>
        <upload-progress-button
          v-if="uploadInProgress"
        />
        <secondary-button
          v-if="datasetId"
          class="dataset-create__skip"
          @click.prevent="continueLater"
        >
          Continue later
        </secondary-button>
      </div>
    </div>
    <div class="dataset-create__body">
      <div
        v-tooltip="title"
        class="dataset-create__title"
      >
        {{ title }}
      </div>
      <div class="dataset-create__content">
        <dataset-create-step-items :dataset-id="datasetId" />
        <div class="dataset-create__boxes">
          <!-- first step of creation does not have a dataset prop, the rest do -->
          <router-view v-if="$route.name === 'DatasetCreationCreateStep'" />
          <router-view
            v-else-if="dataset"
            :dataset="dataset"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import BreadCrumbs from '@/components/Common/BreadCrumbs/V1/BreadCrumbs.vue'
import UploadProgressButton from '@/components/Dataset/UploadProgressButton.vue'
import DatasetCreateStepItems from '@/components/DatasetCreate/DatasetCreateStepItems.vue'
import {
  DatasetPayload,
  V2WorkflowPayload
} from '@/store/types'

@Component({
  name: 'dataset-creation-view',
  components: { BreadCrumbs, DatasetCreateStepItems, UploadProgressButton }
})
export default class DatasetCreationView extends Vue {
  @Getter('uploadInProgress', { namespace: 'datasetUpload' })
  uploadInProgress!: boolean

  @Getter('uploadProgress', { namespace: 'datasetUpload' })
  uploadProgress!: number | null

  @State((state) => state.v2Workflow.editedWorkflow)
  workflow!: V2WorkflowPayload | null

  mounted (): void {
    this.$store.commit('datasetUpload/SET_COMMON_PATH', '')
  }

  get uploadFinished (): boolean {
    return this.uploadProgress === 100
  }

  get datasetId (): number | null {
    return this.$route.params.datasetId
      ? parseInt(this.$route.params.datasetId)
      : null
  }

  get showAnnotationStep (): boolean {
    return !this.$featureEnabled('DARWIN_V2_ENABLED') ||
      this.dataset?.version === 1
  }

  @Watch('datasetId', { immediate: true })
  async onDatasetId (datasetId?: number): Promise<void> {
    if (!datasetId) { return }
    await this.$store.dispatch('dataset/resetCurrentDataset')
    await this.$store.dispatch('dataset/loadDataset', { datasetId })
    if (this.dataset?.version === 2) {
      const { data } = await this.$store.dispatch('dataset/loadV2DatasetItemCounts',
        { dataset: this.dataset })
      if (data) {
        this.$store.commit('dataset/SET_CURRENT_DATASET_DETAILS', data)
      }
    } else {
      const { data } = await this.$store.dispatch(
        'dataset/loadDatasetItemCounts',
        { dataset: this.dataset }
      )
      if (data) {
        this.$store.commit('dataset/SET_CURRENT_DATASET_DETAILS', data)
      }
    }
  }

  @Getter('findById', { namespace: 'dataset' })
  datasetById!: (id: number) => DatasetPayload

  get dataset (): DatasetPayload | null {
    return this.datasetId ? this.datasetById(this.datasetId) : null
  }

  get title (): string {
    return this.dataset
      ? `Create ${this.dataset.name}`
      : 'Create new dataset'
  }

  // TODO: This needs implementation, or removal/
  cancelUpload (): void {}

  continueLater (): void {
    const { datasetId } = this
    if (datasetId !== null) {
      const params = { datasetId: datasetId.toString() }
      this.$router.push({ name: 'DatasetManagementData', params })
    } else {
      this.$router.push({ name: 'DatasetsOverview' })
    }
  }
}
</script>

<style lang="scss" scoped>
.dataset-create {
  position: absolute;
  @include fullsize;
  padding: 16px 50px;
  background: $colorSecondaryLight2;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &--v2 {
    .dataset-create__title {
      @include typography(xl, inter, bold);
    }

    .dataset-create__cancel-upload {
      @include typography(md-1, inter, 500);
    }
  }
}

.dataset-create__buttons {
  @include row;
}

.dataset-create__cancel-upload {
  height: 40px;
  margin-right: 20px;
  border: none;
  border-radius: 6px;
  @include typography(md-1, headlines, 500);
  text-align: center;
  letter-spacing: 0.5px;
  background: transparent;
  color: $colorSecondaryLight;
  cursor: pointer;

  &:active {
    opacity: 0.5;
  }
  &:focus, &:active {
    outline: none;
  }
}

.dataset-create__skip {
  width: 225px;
  margin-left: 20px;
}

.dataset-create__body {
  @include col;
  height: calc(100% - 40px);
}

.dataset-create__title {
  @include typography(xl, headlines, bold);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 30px;

  /* Graple Super Mega Dark */
  color: $colorSecondaryDark;
  margin-top: 10px;
}

.dataset-create__content {
  height: 100%;
  margin: 28px 0;
  border-radius: 10px;
  background: transparent;
  overflow: hidden;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.dataset-create--v2 {
  .dataset-create__box__step-title {
    @include typography(xl-2, inter, 500);
  }

  .dataset-create__box__step-description {
    @include typography(md-1, inter);
  }
}

.dataset-create__boxes {
  width: 100%;
  height: calc(100% - 60px);
  border-radius: 10px;
  overflow: hidden;
}

.dataset-create__box {
  width: 100%;
  height: 100%;
  background: $colorSecondaryLight3;
}

.dataset-create__box--hide {
  display: none !important;
}

.dataset-create__box-left {
  @include col--center;
  width: 45%;
  height: 100%;
  border-radius: 0 0 0 10px;
  background: $colorPrimaryLight2;
  position: relative;
}

.dataset-create__box__step-image {
  flex: 1 1 auto;
  width: 80%;
  object-fit: contain;
  max-height: calc(100% - 200px);
  margin: 30px 0 0 0;
}

.dataset-create__box__step-writings {
  margin: 0 60px 30px 40px;
}

.dataset-create__box__step-title {
  width: 100%;
  margin-bottom: 15px;
  @include typography(xl-2, headlines, 500);
  line-height: 35px;
  letter-spacing: 0.02em;
  color: $colorSecondaryDark;
}

.dataset-create__box__step-description {
  width: 100%;
  @include typography(md-1, default);
  line-height: 22px;

  color: #4A5866;
}

.dataset-create__box-right {
  @include col--center;
  width: 55%;
  height: calc(100% - 20px);
  margin: 10px 0;
  overflow-y: auto;
}
</style>
