<template>
  <div class="classes">
    <div class="classes__header">
      <h4 class="classes__header__title">
        Class distribution
      </h4>
      <gray-rounded-tabs
        class="classes__tabs"
        :tabs="tabs"
        :current-tab.sync="currentTab"
      />
      <div class="classes__score">
        <!-- placeholder for score to be added later -->
      </div>
    </div>
    <class-distribution-annotation-types
      class="classes__types"
      :distribution="typeDistribution"
      :selected-type.sync="selectedType"
    >
      <template #item="props">
        <type-toggle-with-label
          v-if="isTypeEligible(props.type, type)"
          v-bind="props"
          @click="$event => selectedType = $event"
        />
        <v-popover
          v-else
          trigger="hover"
        >
          <type-toggle-with-label
            v-bind="props"
            disabled
            @click="$event => selectedType = $event"
          />
          <template #tooltip>
            Not eligible for selected model type.
          </template>
        </v-popover>
      </template>
    </class-distribution-annotation-types>
    <div
      role="button"
      class="classes__select-all"
      @click="toggleSelectAll"
    >
      <template v-if="selectedClassIds.length === 0">
        Select All
      </template>
      <template v-else>
        Deselect All
      </template>
    </div>
    <class-distribution-table
      :dimension="countDimension"
      :distributions="classDistribution"
      class="classes__table"
    >
      <template #name="{ row }">
        <selectable-class :distribution="row" />
      </template>
    </class-distribution-table>
    <p class="classes__help">
      Click to select classes. Eligible classes are automatically selected
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import TypeToggleWithLabel from '@/components/Common/AnnotationType/TypeToggleWithLabel.vue'
import GrayRoundedTabs from '@/components/Common/Tabs/GrayRoundedTabs.vue'
import ClassDistributionAnnotationTypes from '@/components/Dataset/ClassDistribution/ClassDistributionAnnotationTypes.vue'
import ClassDistributionTable from '@/components/Dataset/ClassDistribution/ClassDistributionTable/ClassDistributionTable.vue'
import {
  AnnotationTypeCount,
  DistributionStatus,
  ClassOverallDistribution,
  ClassDistributionDimension,
  ClassDistributionTab
} from '@/components/Dataset/ClassDistribution/types'
import { getAnnotationClassDistribution } from '@/components/Dataset/ClassDistribution/utils'
import { isTypeEligible } from '@/store/modules/neuralModel/utils'
import {
  AnnotationClassPayload,
  AnnotationTypeName,
  AnnotationTypePayload,
  DatasetPayload,
  DatasetReportPayload,
  ModelType,
  RootState
} from '@/store/types'

import SelectableClass from './SelectableClass.vue'

/**
 * Renders tabbed table UI listing class distribution by image or instances from
 * store data, for the specified dataset.
 */
@Component({
  name: 'class-selection',
  components: {
    ClassDistributionAnnotationTypes,
    ClassDistributionTable,
    GrayRoundedTabs,
    SelectableClass,
    TypeToggleWithLabel
  }
})
export default class ClassSelection extends Vue {
  @State(state => state.neuralModel.newModelDataset)
  dataset!: DatasetPayload

  @Getter('findReportById', { namespace: 'dataset' })
  findReportById!: (id: number) => DatasetReportPayload | null

  @State((state: RootState) => state.neuralModel.newModelClassCounts)
  report!: DatasetReportPayload | null

  // tabs
  readonly tabs: ClassDistributionTab[] = ['instances', 'files']
  currentTab: 'files' | 'instances' = 'instances'

  get countDimension (): ClassDistributionDimension {
    const { currentTab } = this
    if (currentTab === 'files') { return 'countByImages' }
    return 'countByInstances'
  }

  // null means `All` annotation types here
  selectedType: AnnotationTypeName | null = null

  @State(state => state.neuralModel.newModelAnnotationClasses)
  allClasses!: AnnotationClassPayload[]

  get filteredClasses (): AnnotationClassPayload[] {
    const { allClasses, selectedType } = this
    if (!selectedType) { return allClasses }
    return allClasses.filter(c => {
      return c.annotation_types.includes(selectedType)
    })
  }

  get classDistribution (): ClassOverallDistribution[] {
    const { filteredClasses, report } = this
    if (!report) { return [] }
    return getAnnotationClassDistribution(
      filteredClasses,
      report.class_distribution_by_item,
      report.class_distribution_by_annotation_instance
    )
  }

  @State((state: RootState) => state.aclass.types)
  annotationTypes!: AnnotationTypePayload[]

  @Getter('mainAnnotationTypeForClass', { namespace: 'aclass' })
  getMainAnnotationType!: (aClass: AnnotationClassPayload) => AnnotationTypePayload

  get typeDistribution (): AnnotationTypeCount[] {
    return this.annotationTypes
      .filter(t => t.granularity === 'main')
      .map((annotationType) => ({
        annotationType,
        total: this.getTotalCountByAnnotationType(annotationType)
      }))
  }

  getTotalCountByAnnotationType (annotationType: AnnotationTypePayload) {
    const { allClasses, countDimension, report } = this
    if (!report) { return 0 }

    const totalDistribution = getAnnotationClassDistribution(
      allClasses,
      report.class_distribution_by_item,
      report.class_distribution_by_annotation_instance
    )

    return totalDistribution
      .filter(t => this.getMainAnnotationType(t.annotationClass).id === annotationType.id)
      .reduce((total, distribution) => total + distribution[countDimension], 0)
  }

  @State(state => state.neuralModel.newModelSelectedClassIds)
  selectedClassIds!: AnnotationClassPayload['id'][]

  @State(state => state.neuralModel.newModelType)
  type!: ModelType

  toggleSelectAll (): void {
    const { selectedClassIds, type } = this
    if (selectedClassIds.length > 0) {
      this.$store.commit('neuralModel/DESELECT_ALL_NEW_MODEL_CLASSES')
      return
    }

    const classes = this.classDistribution.filter(d =>
      isTypeEligible(this.getMainAnnotationType(d.annotationClass).name, type) &&
        d.status !== DistributionStatus.LOW_DATA &&
        d.status !== DistributionStatus.VERY_LOW_DATA
    ).map(d => d.annotationClass)

    this.$store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', classes)
  }

  // class auto-selection

  mounted () { this.autoSelectClasses() }

  @Watch('allClasses')
  onClasses () { this.autoSelectClasses() }

  @Watch('report')
  onReport () { this.autoSelectClasses() }

  /**
   * Automatically selects classes with instance counts > 100 when distribution
   * is first received.
   */
  autoSelectClasses () {
    const { allClasses, report, type } = this
    if (!report) { return }

    const totalDistribution = getAnnotationClassDistribution(
      allClasses,
      report.class_distribution_by_item,
      report.class_distribution_by_annotation_instance
    )

    const classes = totalDistribution
      .filter(d =>
        isTypeEligible(this.getMainAnnotationType(d.annotationClass).name, type) &&
          d.status !== DistributionStatus.LOW_DATA &&
          d.status !== DistributionStatus.VERY_LOW_DATA
      )
      .map(d => d.annotationClass)
    this.$store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', classes)
  }

  readonly isTypeEligible = isTypeEligible
}
</script>

<style lang="scss" scoped>
.classes__header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  column-gap: 10px;

  > :nth-child(2) {
    justify-self: center;
  }
}

.classes__header__title {
  @include typography(lg-1, Mulish, bold);
}

.classes__select-all {
  @include typography(sm, Mulish, bold);
  color: $colorAliceNight;
  cursor: pointer;
}

.classes__table {
  overflow-y: auto;
}

.classes__help {
  @include typography(md, Mulish, normal);
  color: $colorAliceNight;

}
</style>
