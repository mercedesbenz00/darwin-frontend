<template>
  <div class="download-dataset-report-button">
    <portal to="modal">
      <modal
        name="download-report"
        translate="pop-out"
        :min-width="350"
        :max-width="600"
        :min-height="500"
        :max-height="900"
        width="60%"
        height="85%"
        :click-to-close="false"
        :scrollable="true"
        :classes="['reports-modal']"
        @before-open="onBeforeOpen"
      >
        <div class="modal__content">
          <p class="modal__content__title">
            Dataset Reports
          </p>
          <div
            v-loading="loading"
            class="modal__content__section modal__content__available-versions"
          >
            <div
              v-tooltip="generateBtnTooltip"
              class="button__generate"
            >
              <primary-button
                :disabled="isGenerateNewDisabled"
                @click="onGenerateReport"
              >
                + GENERATE A NEW REPORT
              </primary-button>
            </div>

            <transition-group
              v-if="reports.length"
              name="versions"
              tag="div"
            >
              <dataset-item-report-version
                v-for="reportVersion in reports"
                :key="reportVersion.id"
                class="report-version"
                :report="reportVersion"
              />
            </transition-group>
            <div
              v-else
              class="reports__no-entries"
            >
              You haven't created any reports yet.
            </div>
          </div>
        </div>
        <div class="modal__footer">
          <secondary-button @click="closeReportDialog">
            Close
          </secondary-button>
        </div>
      </modal>
    </portal>
  </div>
</template>

<script lang="ts">
import {
  Ref,
  computed,
  defineComponent,
  ref
} from 'vue'

import { useModal, useStore } from '@/composables'
import { DatasetItemReportPayload } from '@/store/modules/datasetItemReports/types'

import DatasetItemReportVersion from './Sidebar/DatasetItemReportVersion.vue'

export default defineComponent({
  name: 'V2DownloadDatasetReportButton',
  components: { DatasetItemReportVersion },
  props: {
    buttonType: {
      required: false,
      type: String as () => 'primary-button' | 'secondary-light-button',
      default: 'secondary-light-button'
    },
    isOpenMode: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  setup () {
    const { dispatch, getters } = useStore()
    const modal = useModal()

    const reports = computed((): DatasetItemReportPayload[] => {
      return getters['datasetItemReports/reports']
    })

    const loading: Ref<boolean> = ref(false)

    const isGenerateNewDisabled = computed((): boolean => {
      return !!reports.value
        .find((r: DatasetItemReportPayload) => r.state !== 'finished' && r.state !== 'errored')
    })

    const generateBtnTooltip = computed((): string | null  => {
      if (isGenerateNewDisabled.value) {
        return 'Another report is being generated. Please wait for it to complete.'
      }
      return null
    })

    const onGenerateReport = (): void => {
      loading.value = true
      dispatch('datasetItemReports/createDatasetItemReport').finally(() => {
        loading.value = false
      })
    }

    const closeReportDialog = (): void => {
      modal.hide('download-report')
    }

    const onBeforeOpen = (): void => {
      loading.value = true
      dispatch('datasetItemReports/loadDatasetItemReports').finally(() => {
        loading.value = false
      })
    }

    return {
      closeReportDialog,
      generateBtnTooltip,
      isGenerateNewDisabled,
      loading,
      onBeforeOpen,
      onGenerateReport,
      reports
    }
  }
})
</script>

<style lang="scss" scoped>
.reports__no-entries {
  text-align: center;
}

.modal__content__title {
  @include typography(xl, headlines, bold);
  padding: $defaultSpace 0;
  letter-spacing: 0.01em;
  color: $color90Black;
  text-align: center;
}

.modal__content {
  display: grid;
  grid-template-rows: auto 1fr;
  padding: 0;
  max-height: 100%;
  border-top-right-radius: $parent-border-radius;
  border-top-left-radius: $parent-border-radius;
}

.modal__content__section {
  background-color: $colorAliceBlue;
  padding: $defaultSpace;
  margin: 0 calc($defaultSpace / 2);
  transition: max-height .2s ease;
}

.button__generate {
  display: block;
  margin-left: auto;
  width: fit-content;
  margin-bottom: $defaultSpace;
}

.modal__footer {
  @include row--center;
  box-shadow: none;
  background: $colorGriteDark;
}

.report-version {
  margin-bottom: $defaultSpace;

  &:last-child {
    margin-bottom: 0;
  }
}

/**
 * Versions in/out transition
 */
.versions-enter-active, .versions-leave-active {
  transition: all .1s linear;
}
.versions-enter {
  opacity: 0;
  transform: translateY(30px);
}

.versions-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.reports-modal {
  display: grid;
  grid-template-rows: 1fr auto;
}
</style>
