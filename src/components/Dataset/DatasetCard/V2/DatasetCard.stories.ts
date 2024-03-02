import { Meta, Story } from '@storybook/vue'
import RouteMock from 'storybook-vue-router'

import colors from '@/assets/styles/darwin/variables/colors.module.scss'
import store from '@/store'
import { DatasetPayload } from '@/store/types'
import { sfh } from '@/storybook/fixtures/datasets'

import DatasetCardV2 from './DatasetCard.vue'
import { DatasetCardProps } from './types'

export default {
  title: 'Dataset/DatasetCardV2',
  argTypes: {
    data: {
      control: 'object',
      description: 'Item card data'
    },
    selectable: {
      control: 'boolean',
      description: 'Disables or enables card link route',
      table: {
        type: { summary: 'Boolean' },
        defaultValue: { summary: 'false' }
      }
    }
  },
  parameters: {
    backgrounds: {
      default: 'AliceShade',
      values: [
        { name: 'White', value: colors.colorWhite },
        { name: 'AliceBlue', value: colors.colorAliceBlue },
        { name: 'AliceShade', value: colors.colorAliceShade },
        { name: 'AliceShadow', value: colors.colorAliceShadow }
      ]
    }
  },
  decorators: [RouteMock()]
} as Meta<typeof DatasetCardV2>

// DEFAULT
const thumbnails = [
  '/static/test.png',
  '/static/test.png',
  '/static/test.png'
]

const sfhDataset: DatasetPayload = sfh
sfhDataset.thumbnails = thumbnails

export const Default: Story<DatasetCardProps> = (args, { argTypes }) => ({
  components: { DatasetCardV2 },
  props: Object.keys(argTypes),
  store,
  beforeMount (): void {
    store.commit('dataset/RESET_ALL')
    store.commit('dataset/PUSH_DATASET_ITEMS', [sfhDataset])
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
    store.commit('auth/RESET_ALL')
  },
  data: () => ({
    sfhDataset,
    selectedDataset: sfhDataset
  }),
  template: `
    <div style="width:248px;">
      <dataset-card-v2
        :id="\`dataset-${sfhDataset.id}\`"
        :key="sfhDataset.id"
        :dataset="sfhDataset"
        v-bind="$props"
      />
    </div>
  `
})

Default.args = {
  dataset: sfhDataset,
  selectable: false
}
