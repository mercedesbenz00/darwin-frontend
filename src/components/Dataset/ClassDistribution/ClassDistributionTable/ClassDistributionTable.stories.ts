import { ClassDistributionDimension } from '@/components/Dataset/ClassDistribution/types'
import {
  lowerDataDistribution,
  mediumDataDistribution,
  balancedDataDistribution
} from '@/storybook/fixtures/classDistributions'

import ClassDistributionTable from './ClassDistributionTable.vue'

export default {
  title: 'Dataset/ClassDistribution/ClassDistributionTable'
}

export const LowerData = () => ({
  components: { ClassDistributionTable },
  data () {
    const dimension: ClassDistributionDimension = 'countByInstances'
    return {
      dimension,
      distributions: lowerDataDistribution
    }
  },
  template: `
    <class-distribution-table
      :dimension="dimension"
      :distributions="distributions"
    />
  `
})

export const MediumData = () => ({
  components: { ClassDistributionTable },
  data () {
    const dimension: ClassDistributionDimension = 'countByInstances'
    return {
      dimension,
      distributions: mediumDataDistribution
    }
  },
  template: `
    <class-distribution-table
      :dimension="dimension"
      :distributions="distributions"
    />
  `
})

export const BalancedData = () => ({
  components: { ClassDistributionTable },
  data () {
    const dimension: ClassDistributionDimension = 'countByInstances'
    return {
      dimension,
      distributions: balancedDataDistribution
    }
  },
  template: `
    <class-distribution-table
      :dimension="dimension"
      :distributions="distributions"
    />
  `
})
