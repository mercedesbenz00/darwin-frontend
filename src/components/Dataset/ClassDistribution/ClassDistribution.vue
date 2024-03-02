<template>
  <div class="class-distribution">
    <div class="class-distribution__header">
      <h3 class="class-distribution__title">
        Class Distribution
      </h3>
      <gray-rounded-tabs
        class="class-distribution__tabs"
        :tabs="tabs"
        :current-tab.sync="currentTab"
      />
    </div>

    <div class="class-distribution__content">
      <class-distribution-annotation-types
        class="class-distribution__types"
        :distribution="annotationTypeCounts"
        :selected-type.sync="selectedAnnotationType"
      />
      <div class="class-distribution-table_container">
        <class-distribution-table
          class="class-distribution-table"
          :dimension="countDimension"
          :distributions="filteredClassDistributions"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { orderBy } from 'lodash'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import GrayRoundedTabs from '@/components/Common/Tabs/GrayRoundedTabs.vue'
import {
  AnnotationClassPayload,
  AnnotationTypePayload,
  DatasetReportClassDistributionPayload,
  RootState
} from '@/store/types'

import ClassDistributionAnnotationTypes from './ClassDistributionAnnotationTypes.vue'
import ClassDistributionTable from './ClassDistributionTable/ClassDistributionTable.vue'
import {
  AnnotationTypeCount,
  ClassOverallDistribution,
  ClassDistributionTab,
  ClassDistributionDimension
} from './types'
import { getAnnotationClassDistribution } from './utils'

@Component({
  name: 'class-distribution',
  components: {
    ClassDistributionAnnotationTypes,
    ClassDistributionTable,
    GrayRoundedTabs
  }
})
export default class ClassDistribution extends Vue {
  @Prop({ required: true })
  annotationClasses!: AnnotationClassPayload[]

  @State((state: RootState) => state.aclass.types)
  annotationTypes!: AnnotationTypePayload[]

  @Prop({ required: true })
  distributionByImage!: DatasetReportClassDistributionPayload[]

  @Prop({ required: true })
  distributionByAnnotationInstance!: DatasetReportClassDistributionPayload[]

  readonly tabs: ClassDistributionTab[] = ['instances', 'files']
  currentTab: ClassDistributionTab = 'instances'

  get countDimension (): ClassDistributionDimension {
    const { currentTab } = this
    if (currentTab === 'instances') { return 'countByInstances' }
    return 'countByImages'
  }

  // null means `All` annotation types here
  selectedAnnotationType: string | null = null

  @Getter('mainAnnotationTypeForClass', { namespace: 'aclass' })
  getMainAnnotationType!: (data: AnnotationClassPayload) => AnnotationTypePayload

  get filteredClasses (): AnnotationClassPayload[] {
    const { annotationClasses, selectedAnnotationType } = this
    if (!selectedAnnotationType) {
      return annotationClasses
    }

    return annotationClasses.filter(a => {
      const mainType = this.getMainAnnotationType(a)
      return mainType.name === selectedAnnotationType
    })
  }

  get classDistributions (): ClassOverallDistribution[] {
    const classDistributions = getAnnotationClassDistribution(
      this.annotationClasses,
      this.distributionByImage,
      this.distributionByAnnotationInstance
    )

    return orderBy(classDistributions, ['countByInstances'], ['desc'])
  }

  get filteredClassDistributions (): ClassOverallDistribution[] {
    const classDistributions = getAnnotationClassDistribution(
      this.filteredClasses,
      this.distributionByImage,
      this.distributionByAnnotationInstance
    )

    return orderBy(classDistributions, ['countByInstances'], ['desc'])
  }

  get annotationTypeCounts (): AnnotationTypeCount[] {
    return this.annotationTypes.map((annotationType) => ({
      annotationType,
      total: this.getTotalCountByAnnotationType(annotationType)
    }))
  }

  getTotalCountByAnnotationType (annotationType: AnnotationTypePayload) {
    return this.classDistributions
      .filter(distribution => {
        const mainType = this.getMainAnnotationType(distribution.annotationClass)
        return mainType.id === annotationType.id
      })
      .reduce((total, distribution) => {
        const count = this.currentTab === 'instances'
          ? distribution.countByInstances
          : distribution.countByImages
        return total + count
      }, 0)
  }
}
</script>

<style lang="scss" scoped>
.class-distribution {
  width: 100%;
  @include col;
}

.class-distribution__header {
  position: relative;
  width: 100%;
  @include row;
  align-items: center;
}

.class-distribution__title {
  @include typography(lg-1, default, bold);
  color: $color90Black;
}

.class-distribution__tabs {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.class-distribution__content {
  @include col;
  width: 100%;
  margin-top: 20px;
  overflow: hidden;
}

.class-distribution__types {
  width: 100%;
  margin-bottom: 20px;
}

.class-distribution-table_container {
  max-height: 500px;
  overflow-y: auto;
}

.class-distribution-table {
  width: 100%;
}
</style>
