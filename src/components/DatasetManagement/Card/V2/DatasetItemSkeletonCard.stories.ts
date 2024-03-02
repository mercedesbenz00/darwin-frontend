import { Meta, Story } from '@storybook/vue'
import RouteMock from 'storybook-vue-router'

import colors from '@/assets/styles/darwin/variables/colors.module.scss'
import store from '@/store'

import DatasetItemSkeletonCard from './DatasetItemSkeletonCard.vue'

export default {
  title: 'DatasetManagement/DatasetItemSkeletonCard',
  argTypes: {
    data: {
      control: 'object',
      description: 'Item card skeleton data'
    }
  },
  parameters: {
    backgrounds: {
      default: 'AliceShade',
      values: [
        {
          name: 'White',
          value: colors.colorWhite
        },
        {
          name: 'AliceBlue',
          value: colors.colorAliceBlue
        },
        {
          name: 'AliceShade',
          value: colors.colorAliceShade
        },
        {
          name: 'AliceShadow',
          value: colors.colorAliceShadow
        }
      ]
    }
  },
  decorators: [RouteMock()]
} as Meta<typeof DatasetItemSkeletonCard>

export const Default: Story = (args, { argTypes }) => ({
  components: { DatasetItemSkeletonCard },
  props: Object.keys(argTypes),
  store,
  template: `
    <div style='width:200px;'>
      <dataset-item-skeleton-card
      />
    </div>
  `
})

Default.args = {
}
