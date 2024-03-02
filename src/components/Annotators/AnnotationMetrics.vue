<template>
  <div class="metrics">
    <div class="metrics__header">
      <h2 class="metrics__header__left metrics__header__title">
        {{ dataset.name }}
      </h2>
      <div class="metrics__header__right">
        <tab-selector
          :options="dataRanges"
          :value="dataRange"
          @change="dataRange = $event"
        />
        <loading-wrapper
          :loading="downloadingReport"
          background-color="transparent"
          size="small"
          class="metrics__header__download"
        >
          <download-button @click="download" />
        </loading-wrapper>
      </div>
    </div>
    <div class="metrics__stats metrics__stats--top">
      <progress-donut-chart
        :dataset="dataset"
        subtext="Overall Progress"
        class="metrics__stats__donut-chart"
      />
      <div class="metrics__stats__bar-chart">
        <lazy-render>
          <annotation-bar-chart
            :data-range="dataRange"
            :dataset="dataset"
            :by-user-report="byUserReport"
            :total-report="totalReport"
          />
        </lazy-render>
      </div>
    </div>
    <lazy-render>
      <data-loader
        :dataset="dataset"
        :from="from"
        :data-range="dataRange"
      />
    </lazy-render>
    <annotator-stats
      class="metrics__stats"
      :by-user-report="byUserReport"
      :total-report="totalReport"
      :data-range="dataRange"
      :dataset="dataset"
      :data-granularity="dataGranularity"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import LazyRender from '@/components/Common/LazyRender'
import LoadingWrapper from '@/components/Common/LoadingWrapper.vue'
import TabSelector from '@/components/Common/TabSelector/TabSelector.vue'
import { TabSelectorOption } from '@/components/Common/TabSelector/types'
import { AnnotationReport } from '@/store/modules/annotators/types'
import { DatasetPayload, DatasetAnnotationReportPayload } from '@/store/types'

import AnnotationBarChart from './AnnotationMetrics/AnnotationBarChart.vue'
import AnnotatorStats from './AnnotationMetrics/AnnotatorStats.vue'
import DataLoader from './AnnotationMetrics/DataLoader'
import DownloadButton from './AnnotationMetrics/DownloadButton.vue'
import ProgressDonutChart from './AnnotationMetrics/ProgressDonutChart.vue'
import { AnnotationDataGranularity, AnnotationDataRange } from './AnnotationMetrics/types'
import { fromFromRange, granularityFromRange } from './AnnotationMetrics/utils'

const RANGE_OPTIONS: TabSelectorOption[] = [
  { value: 'total', description: 'All data from the beginning, with daily resolution' },
  { value: 'month', description: 'Data from the past 30 days, with daily resolution' },
  { value: 'week', description: 'Data from the past week, with hourly resolution' },
  { value: 'day', description: 'Data from the past 24 hours, with hourly resolution' }
]

@Component({
  name: 'annotation-metrics',
  components: {
    AnnotationBarChart,
    AnnotatorStats,
    DataLoader,
    DownloadButton,
    LazyRender,
    LoadingWrapper,
    ProgressDonutChart,
    TabSelector
  }
})
export default class AnnotationMetrics extends Vue {
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  dataRange: AnnotationDataRange = 'month'
  dataRanges = RANGE_OPTIONS

  get from (): string | null {
    return fromFromRange(this.dataRange)
  }

  get dataGranularity (): AnnotationDataGranularity {
    return granularityFromRange(this.dataRange)
  }

  // reports

  @State(state => state.annotators.annotationReports)
  annotationReports!: AnnotationReport[]

  get byUserReport (): DatasetAnnotationReportPayload[] {
    const { annotationReports: reports } = this

    const report = reports.find(r =>
      r.params.datasetId === this.dataset.id &&
      r.params.groupBy === 'dataset,user' &&
      r.params.granularity === this.dataGranularity &&
      r.params.from === this.from
    )

    return report ? report.data : []
  }

  get totalReport (): DatasetAnnotationReportPayload[] {
    const { annotationReports: reports } = this
    const report = reports.find(r =>
      r.params.datasetId === this.dataset.id &&
      r.params.groupBy === 'dataset' &&
      r.params.granularity === this.dataGranularity &&
      r.params.from === this.from
    )

    return report ? report.data : []
  }

  // actions

  downloadingReport: boolean = false

  async download () {
    this.downloadingReport = true

    const params = {
      dataset: this.dataset,
      granularity: this.dataGranularity
    }

    const { error } = await this.$store.dispatch('annotators/downloadAnnotationReport', params)
    if (error) { this.$store.dispatch('toast/warning', { content: error.message }) }

    this.downloadingReport = false
  }
}
</script>

<style lang="scss" scoped>
.metrics {
  @include col;
}

.metrics__header {
  -webkit-position: sticky;
  position: sticky;
  z-index: 1;
  top: 0;
  padding: 15px;
  background: $colorSecondaryLight3;
  align-items: center;

  @include row;

  margin-bottom: 15px;
}

.metrics__header__title {
  @include typography(xl, headers, bold);
}

.metrics__header__left {
  flex: auto;
}

.metrics__header__right {
  :not(:last-child) {
    margin-right: 25px;
  }
  @include row--center;
  flex: 1;

  justify-content: flex-end;
}

.metrics__header__download {
  width: 44px;
  height: 44px;
}

.metrics__stats {
  border-radius: 3px;
  width: 100%;
}

.metrics__stats:not(:last-child) {
  margin-bottom: 15px;
}

// dataset title and date range selection are also sticky, so we must override default
// sticky properties on the child component
.metrics__stats :deep(.stats__collapse-button) {
  top: 74px;
}

.metrics__stats :deep(.spinner) {
  padding: 15px;
}

.metrics__stats--top {
  display: grid;
  grid-template-columns: min-content auto;
}

.metrics__stats__donut-chart{
  width: 300px;
}

.metrics__stats__bar-chart{
  flex: 1;
}

</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.metrics__header__download {
  .v-loading {
    top: 7px !important;
  }
}
</style>
