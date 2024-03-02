<template>
  <div
    v-if="expanded"
    class="stats stats--expanded"
  >
    <button
      class="stats__collapse-button"
      @click="expanded = false"
    >
      <img src="/static/imgs/chevron_top.svg">
      <span>Collapse</span>
    </button>
    <annotation-chart
      :annotation-data="allData"
      :dimension="dimension"
      :data-granularity="dataGranularity"
      :data-range="dataRange"
      :min-date="minDate"
    >
      <all-toggle
        class="stats__chart-toggles__all"
        multiselect
        :selected="visibleMemberIds.includes('total')"
        :label="false"
        @click="toggle('total', $event)"
      />
      <member-toggle
        v-for="{ member, visible } in annotationData"
        :key="member.id"
        class="stats__chart-toggles__annotator"
        multiselect
        :member="member"
        :label="false"
        :selected="visible"
        @click="toggle(member.id, $event)"
      />
    </annotation-chart>
    <dimension-selector
      class="stats__annotator"
      :dimension="dimension"
      :chart-data="aggregateData"
      @select="setDimensionAndSelect($event, 'total')"
    >
      <all-toggle
        class="stats__chart-toggles__all"
        :selected="visibleMemberIds.includes('total')"
        @click="toggle('total', $event)"
      />
    </dimension-selector>
    <dimension-selector
      v-for="memberData in annotationData"
      :key="memberData.member.id"
      class="stats__annotator"
      :dimension="dimension"
      :chart-data="memberData"
      @select="setDimensionAndSelect($event, memberData.member.id)"
    >
      <member-toggle
        :member="memberData.member"
        :selected="visibleMemberIds.includes(memberData.member.id)"
        @click="toggle(memberData.member.id, $event)"
      />
    </dimension-selector>
  </div>
  <button
    v-else
    class="stats stats--collapsed"
    @click="expanded=true"
  >
    <div class="stats__annotators">
      <team-member-avatar
        v-for="{ member } in annotationData"
        :key="member.id"
        class="stats__annotators__annotator"
        :member="member"
      />
    </div>
    <div class="stats__expand-text">
      Click to expand...
    </div>
  </button>
</template>
<script lang="ts">
import { minBy } from 'lodash'
import moment from 'moment'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import TeamMemberAvatar from '@/components/Common/Avatar/V1/ResponsiveTeamMemberAvatar.vue'
import {
  DatasetAnnotationReportPayload,
  DatasetPayload,
  MembershipPayload,
  DatasetAnnotatorPayload
} from '@/store/types'

import AnnotationChart from './AnnotatorStats/AnnotationChart.vue'
import DimensionSelector from './AnnotatorStats/DimensionSelector.vue'
import AllToggle from './Common/AllToggle.vue'
import MemberToggle from './Common/MemberToggle.vue'
import {
  AnnotationDataGranularity,
  AnnotationDataRange,
  ChartDimension,
  AnnotationChartData
} from './types'
import {
  adaptReportData,
  aggregateByDate,
  buildFrom,
  chartFormat,
  dateRange,
  expandData,
  getDimensionsData
} from './utils'

@Component({
  name: 'annotator-stats',
  components: {
    AnnotationChart,
    AllToggle,
    DimensionSelector,
    MemberToggle,
    TeamMemberAvatar
  }
})
export default class AnnotatorStats extends Vue {
  @Prop({ required: true, type: Array })
  byUserReport!: DatasetAnnotationReportPayload[]

  @Prop({ required: true, type: Array })
  totalReport!: DatasetAnnotationReportPayload[]

  @Prop({ required: true, type: String })
  dataRange!: AnnotationDataRange

  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  @Prop({ required: false, type: String, default: 'hour' })
  dataGranularity!: AnnotationDataGranularity

  @Getter('relevantTeamMemberships', { namespace: 'team' })
  relevantTeamMemberships!: MembershipPayload[]

  get teamMembers (): MembershipPayload[] {
    return this.relevantTeamMemberships
  }

  @Getter('annotatorsForDataset', { namespace: 'dataset' })
  annotatorsForDataset!: (datasetId: number) => DatasetAnnotatorPayload[]

  get datasetAnnotatorUserIds (): number[] {
    return this.annotatorsForDataset(this.dataset.id).map(annotator => annotator.user_id)
  }

  expanded: boolean = false
  dimension: ChartDimension = 'annotationTime'

  // member visibility toggling

  visibleMemberIds: (number | 'total')[] = ['total']

  toggle (id: number | 'total', event: MouseEvent) {
    if (event.shiftKey) {
      this.visibleMemberIds = [id]
    } else {
      this.toggleOne(id)
    }
  }

  toggleOne (id: number | 'total') {
    const index = this.visibleMemberIds.indexOf(id)
    if (index > -1) {
      this.visibleMemberIds.splice(index, 1)
    } else {
      this.visibleMemberIds.push(id)
    }
  }

  // chart/report data

  get minDate (): string {
    const oldestReport = minBy(this.byUserReport, ad => ad.date)
    return oldestReport ? oldestReport.date : moment.utc().startOf('year').format(this.format)
  }

  get fromDate (): string {
    if (this.dataRange === 'total') { return this.minDate }
    return buildFrom(this.dataRange)
  }

  get format () {
    return chartFormat(this.dataGranularity)
  }

  get dates () {
    return dateRange(this.fromDate, this.dataGranularity, this.format)
  }

  get aggregateData (): AnnotationChartData {
    const data = this.dates
      .map(date => aggregateByDate(date, this.totalReport))
      .map(adaptReportData)
    return {
      data,
      dimensions: getDimensionsData(data),
      visible: this.visibleMemberIds.includes('total')
    }
  }

  get annotationData (): AnnotationChartData[] {
    return this.teamMembers.map(member => {
      const reports = this.byUserReport.filter(ad => ad.user_id === member.user_id)
      const data = expandData(member, reports, this.dates).map(adaptReportData)
      const visible = this.visibleMemberIds.includes(member.id)
      const dimensions = getDimensionsData(data)
      return { data, dimensions, member, visible }
    }).filter(({ member, dimensions }) => {
      /**
       * If member is not an annotator, just check if they have annotated or not
       * If yes, show them. If no, hide them
       *
       * If member is an annotator, check if they have taken part in the
       * annotation of this dataset or not. This means they are shown even if
       * they got removed from the dataset, as long as they made annotations
       * in the past.
       *
       * If member is an annotator and is included in the current dataset,
       * show them regardless of them having made any annotations
       */
      return dimensions.annotationTime ||
        dimensions.annotationsCreated ||
        dimensions.avgTimePerAnnotation ||
        dimensions.imagesAnnotated ||
        dimensions.reviewPassRate ||
        (member.role === 'annotator' && this.datasetAnnotatorUserIds.includes(member.user_id))
    })
  }

  get allData (): (AnnotationChartData)[] {
    return [this.aggregateData].concat(this.annotationData)
  }

  setDimensionAndSelect (dimension: ChartDimension, id: number | 'total') {
    this.dimension = dimension
    if (!this.visibleMemberIds.includes(id)) { this.visibleMemberIds.push(id) }
  }
}
</script>

<style lang="scss" scoped>

.stats--expanded {
  @include col;
}

.stats__collapse-button {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 1;

  @include row--center;
  @include typography(lg, default, bold);
  padding: 10px;
  background: $colorSecondaryLight2;
  color: $colorSecondaryLight;
  justify-items: center;
  vertical-align: baseline;
  text-transform: uppercase;

  transition: background-color .2s ease;
}

.stats__collapse-button:hover {
  background: $colorSecondaryLight1;
}

.stats__collapse-button img {
  margin-right: 5px;
}

.stats__annotator {
  margin-top: 10px;
}

.stats--collapsed {
  @include row--distributed;
  align-items: center;
  padding: 15px;

  background: $colorWhite;
  transition: background-color .2s ease;
}

.stats--collapsed:hover {
  background: $colorLineGrey;
}

.stats__annotators {
  display: block;
  text-align: left;
  overflow: hidden;
  height: 35px;;
  text-overflow: clip;
}

.stats__annotators__annotator {
  display: inline-flex;
  vertical-align: middle;
  height: 35px;
  width: 35px;
}

.stats__annotators__annotator:not(:first-child) {
  margin-left: 5px;
}

.stats__expand-text {
  @include typography(lg-1, headlines);
  color: $colorSecondaryLight;
  flex: 1 0 auto;
}

.stats__expand-text:not(:first-child) {
  text-align: right;
  margin-left: 25px;
}
</style>
