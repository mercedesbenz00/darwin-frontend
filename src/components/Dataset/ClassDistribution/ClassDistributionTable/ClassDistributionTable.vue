<template>
  <v-table
    no-headers
    no-pagination
    :columns="[{
      key: 'name',
      class: 'class-distribution-table__class__name'
    }, {
      key: 'status',
      class: 'class-distribution-table__class__status'
    }, {
      key: 'count',
      class: 'class-distribution-table__class__count'
    }]"
    :data="distributions"
  >
    <template #name="{ row }">
      <div
        v-tooltip="getTooltip(row)"
      >
        <slot
          name="name"
          :row="row"
        >
          <class-item :annotation-class="row.annotationClass" />
        </slot>
      </div>
    </template>
    <template #status="{ row }">
      <class-distribution-status
        v-tooltip="getTooltip(row)"
        v-if="row[dimension] > 0"
        :status="row.status"
      />
    </template>
    <template #count="{ row }">
      <class-distribution-progress
        v-tooltip="getTooltip(row)"
        :color="row.annotationClass.metadata._color"
        :count="row[dimension]"
        :max-count="maxCount"
      />
    </template>
  </v-table>
</template>

<script lang="ts">
import { maxBy } from 'lodash'
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Table } from '@/components/Common/Table/V1'
import {
  ClassOverallDistribution,
  DistributionStatus,
  ClassDistributionDimension
} from '@/components/Dataset/ClassDistribution/types'
import { TooltipOptions } from '@/types'

import ClassDistributionProgress from './ClassDistributionProgress.vue'
import ClassDistributionStatus from './ClassDistributionStatus.vue'
import ClassItem from './ClassItem.vue'

@Component({
  name: 'class-distribution-table',
  components: {
    ClassDistributionProgress,
    ClassDistributionStatus,
    ClassItem,
    'v-table': Table
  }
})
export default class ClassDistributionTable extends Vue {
  @Prop({ required: true })
  distributions!: ClassOverallDistribution[]

  @Prop({ required: true })
  dimension!: ClassDistributionDimension

  get maxCount (): number {
    const { distributions, dimension } = this
    const distribution = maxBy(distributions, dimension)
    if (!distribution) { return 0 }
    return distribution[dimension]
  }

  getTooltip (row: ClassOverallDistribution): TooltipOptions | undefined {
    return row[this.dimension]
      ? { content: this.DISTRIBUTION_STATUS_ERROR_MESSAGES[row.status] }
      : undefined
  }

  readonly DISTRIBUTION_STATUS_ERROR_MESSAGES = {
    [DistributionStatus.VERY_OVERREPRESENTED]:
      'Over 50% above the mean. Try increasing the frequency of other classes.',
    [DistributionStatus.OVERREPRESENTED]:
      'Over 30% above the mean. Try increasing the frequency of other classes.',
    [DistributionStatus.VERY_LOW_DATA]:
      'Less than 30 instances throughout the dataset. This class will not be learnable.',
    [DistributionStatus.VERY_UNDERREPRESENTED]:
      'Over 30% below the mean. Try increasing the frequency of other classes.',
    [DistributionStatus.UNDERREPRESENTED]:
      'Over 30% below the mean. Try increasing the frequency of other classes.',
    [DistributionStatus.LOW_DATA]:
      'Less than 100 instances throughout the dataset. This class will not be learnable.',
    [DistributionStatus.MEDIUM_LOW_DATA]:
      'Less than 500 instances throughout the dataset. This class will perform poorly.',
    [DistributionStatus.BALANCED]: 'This class is balanced'
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.class-distribution-table {
  &__class__name {
    width: 160px;
  }

  &__class__status {
    width: 180px;
  }

  &__class__count {
    flex: 1;
  }
}
</style>
