<template>
  <div>
    <secondary-button
      class="reports-button"
      size="medium"
      @click="showModal"
    >
      Download Report (CSV)
    </secondary-button>

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
          <secondary-button @click="closeModal">
            Close
          </secondary-button>
        </div>
      </modal>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import { DatasetItemReportPayload } from '@/store/modules/datasetItemReports/types'

import DatasetItemReportVersion from './DatasetItemReportVersion.vue'

/**
 * Report button
 * The root element is the button that triggers
 * modal window with the list of all generated reports
 */
@Component({
  name: 'download-full-item-report-button',
  components: {
    DatasetItemReportVersion
  }
})
export default class DownloadFullItemReportButton extends Vue {
  @Getter('reports', { namespace: 'datasetItemReports' })
  reports!: DatasetItemReportPayload[]

  loading: boolean = false

  get isGenerateNewDisabled (): boolean {
    return !!this.reports
      .find((r: DatasetItemReportPayload) => r.state !== 'finished' && r.state !== 'errored')
  }

  get generateBtnTooltip (): string | null {
    if (this.isGenerateNewDisabled) {
      return 'Another report is being generated. Please wait for it to complete.'
    }
    return null
  }

  showModal (): void {
    this.$modal.show('download-report')
  }

  closeModal (): void {
    this.$modal.hide('download-report')
  }

  onBeforeOpen (): void {
    this.loading = true
    this.$store.dispatch('datasetItemReports/loadDatasetItemReports').finally(() => {
      this.loading = false
    })
  }

  onGenerateReport (): void {
    this.loading = true
    this.$store.dispatch('datasetItemReports/createDatasetItemReport').finally(() => {
      this.loading = false
    })
  }
}
</script>

<style lang="scss" scoped>
.reports-button {
  width: 100%;
}

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
