<template>
  <div class="dataset-report">
    <div class="dataset-report__header">
      <div class="dataset-report__header__title">
        <h1>{{ date }}</h1>
      </div>

      <div class="dataset-report__header__actions">
        <download-button
          v-if="isFinished"
          class="dataset-report__icon-button dataset-report__header__download-button"
          @click="downloadVersion"
        />
        <circle-spinner
          v-else
          class="dataset-report__spinner"
        />

        <button
          v-tooltip="deleteTooltip"
          :class="[
            'dataset-report__icon-button dataset-report__header__trash-button'
          ]"
          @click="deleteVersion"
        >
          <trash-icon />
        </button>
      </div>
    </div>
    <div class="dataset-report__body">
      <p :class="{'loading-dots': isGenerating}">
        {{ state }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import { TrashIcon } from '@/assets/icons/V1'
import DownloadButton from '@/components/Annotators/AnnotationMetrics/DownloadButton.vue'
import { CircleSpinner } from '@/components/Common/LoadingIndicators'
import { DatasetItemReportPayload } from '@/store/modules/datasetItemReports/types'
import { MembershipRole } from '@/store/types'
import { formatDate } from '@/utils'

/**
 * Report item that handle:
 * - delete
 * - download
 * - display report status (Generating or Complete)
 *
 * @prop {DatasetItemReportPayload} report - report object
 */
@Component({
  name: 'dataset-item-report-version',
  components: { DownloadButton, TrashIcon, CircleSpinner }
})
export default class DatasetItemReportVersion extends Vue {
  @Prop({ required: true, type: Object })
  report!: DatasetItemReportPayload

  @Getter('roleInCurrentTeam', { namespace: 'user' })
  currentUserRole!: MembershipRole | null

  loading: boolean = false
  refreshInterfal: ReturnType<typeof setInterval> | null = null

  get date (): string {
    return formatDate(this.report.requested_at, 'DD/MM/YYYY HH:mm')
  }

  get state (): string {
    if (this.report.state === 'finished') {
      return 'Complete'
    }

    return 'Generating'
  }

  get isFinished (): boolean {
    return this.report.state === 'finished'
  }

  get isGenerating (): boolean {
    return this.report.state !== 'finished'
  }

  get deleteTooltip (): { content: string } {
    return { content: 'Delete' }
  }

  @Watch('state')
  onStateChange (): void {
    if (!this.isGenerating) {
      this.cancelRefresh()
    }
  }

  mounted (): void {
    if (this.isGenerating) {
      this.refreshInterfal = setInterval(() => {
        this.refreshItem()
      }, 3000)
    }
  }

  beforeDestroy (): void {
    this.cancelRefresh()
  }

  refreshItem (): void {
    this.$store.dispatch('datasetItemReports/loadDatasetItemReport', { reportId: this.report.id })
  }

  deleteVersion (): void {
    this.cancelRefresh()

    this.loading = true
    this.$store.dispatch('datasetItemReports/deleteDatasetItemReport', {
      reportId: this.report.id
    }).finally(() => {
      this.loading = false
    })
  }

  downloadVersion (): void {
    if (this.report.state === 'finished' && this.report.url) {
      window.location.href = this.report.url
    }
  }

  cancelRefresh (): void {
    if (this.refreshInterfal) {
      clearInterval(this.refreshInterfal)
    }
  }
}
</script>

<style lang="scss" scoped>
.dataset-report__header {
  @include row--distributed;
}

.dataset-report__header p {
  @include typography(md-1, headlines, bold);
  color: $colorSecondaryLight;
}

.dataset-report__header__title {
  @include row;
  align-items: center;
  background-color: $colorSecondaryLight2;
  padding: calc($defaultSpace / 2) $defaultSpace;
  border-radius: 5px 5px 0 0;
}

.dataset-report__header__title h1 {
  @include typography(md-1, headlines, bold);
  color: $colorSecondaryDark;
}

.dataset-report__header__title svg {
  margin-left: 12px;
}

.dataset-report__header__actions {
  display: grid;
  grid-template-columns: 30px 30px;
  align-items: center;
  justify-content: center;
  column-gap: 5px;
}

.dataset-report__header__trash-button {
  padding: 6px;

  transition: background-color .2s ease;

  &:hover:enabled {
    background: $colorSecondaryLight2;
  }
}

.dataset-report__body {
  @include row--center;
  background-color: $colorLineGrey;
  padding: calc($defaultSpace / 2) $defaultSpace;
  border-radius: 0 5px 5px 5px;
  justify-content: flex-start;
}

.loading-dots {
  &::after {
    overflow: hidden;
    display: inline-block;
    vertical-align: bottom;
    animation: ellipsis steps(4,end) 1s infinite;
    content: "\2026"; /* ascii code for the ellipsis character */
    width: 0px;
  }
}

@keyframes ellipsis {
  to {
    width: .85em;
  }
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.dataset-report {
  .dataset-report__icon-button {
    display: block;
    position: relative;
    background: transparent;
    width: 33px;
    height: 33px;
    border-radius: 50%;
    padding: 4px;

    svg {
      position: relative;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      color: $colorAliceNight;
    }
  }

  .dataset-report__spinner {
    .sk-fading-circle {
      $size: 22px;

      padding: 4px;
      margin: 0 auto;
      width: $size !important;
      height: $size !important;

      .sk-circle::before {
        background-color: $colorAliceNight;
      }
    }
  }
}
</style>
