<template>
  <div class="overview__content">
    <div
      v-if="report"
      class="overview__card"
    >
      <div class="overview__card__title">
        Dataset Progress
      </div>
      <dataset-progress-section
        class="overview__card__body"
        v-if="!!report"
        :report="report"
      />
    </div>
    <div
      v-if="classDistributionByItem && classDistributionByAnnotationInstance"
      class="overview__card"
    >
      <class-distribution
        :annotation-classes="datatasetClasses"
        :annotation-types="annotationTypes"
        :distribution-by-image="classDistributionByItem"
        :distribution-by-annotation-instance="classDistributionByAnnotationInstance"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import ClassDistribution from '@/components/Dataset/ClassDistribution/ClassDistribution.vue'
import DatasetDetailLayout from '@/components/Dataset/DatasetDetail/DatasetDetailLayout.vue'
import DatasetProgressSection from '@/components/Dataset/DatasetDetail/Overview/DatasetProgressSection.vue'
import {
  AnnotationClassPayload,
  AnnotationTypePayload,
  DatasetPayload,
  DatasetReportPayload,
  TeamPayload,
  RootState
} from '@/store/types'
import { getDatasetClasses } from '@/utils'

@Component({
  name: 'overview-content',
  components: { ClassDistribution, DatasetDetailLayout, DatasetProgressSection }
})
export default class OverviewContent extends Vue {
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  // report

  @Getter('findReportById', { namespace: 'dataset' })
  findReportById!: (id: number) => DatasetReportPayload | null

  @State((state: RootState) => state.aclass.classes)
  annotationClasses!: AnnotationClassPayload[]

  @State(state => state.team.currentTeam)
  currentTeam!: TeamPayload

  @State((state: RootState) => state.aclass.types)
  annotationTypes!: AnnotationTypePayload[]

  get report (): DatasetReportPayload | null {
    return this.findReportById(this.dataset.id)
  }

  get datatasetClasses () {
    return getDatasetClasses(this.annotationClasses, this.dataset.id)
  }

  get classDistributionByItem () {
    const { report } = this
    if (!report) { return null }
    return report.class_distribution_by_item
  }

  get classDistributionByAnnotationInstance () {
    return this.report && this.report.class_distribution_by_annotation_instance
  }

  mounted () {
    this.loadReport(this.dataset.id)
  }

  async loadReport (datasetId: number) {
    const { error } = await this.$store.dispatch('dataset/getReport', { datasetId })

    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
    }
  }
}
</script>

<style lang="scss" scoped>
.overview__content {
  overflow: auto;
}

.overview__card {
  @include col;

  &:not(:last-child) {
    padding-bottom: 25px;
    border-bottom: 1px solid $colorAliceShadow;
  }

  &:not(:first-child) {
    margin-top: 25px;
  }
}

.overview__card__title {
  @include typography(lg-1, default, bold);
  color: $color90Black;
  text-transform: uppercase;
  margin-bottom: 25px;
}

.overview__card__body__table {
  margin-top: -25px;
}
</style>
