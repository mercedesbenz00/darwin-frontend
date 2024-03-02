import { Meta, Story } from '@storybook/vue'
import RouteMock from 'storybook-vue-router'

import colors from '@/assets/styles/darwin/variables/colors.module.scss'
import { Grid, GridProps } from '@/components/Common/Grid'
import store from '@/store'
import { DatasetPayload } from '@/store/types'
import { sfh } from '@/storybook/fixtures/datasets'

import { DatasetCardV2 } from './'

require('vue-virtual-scroller/dist/vue-virtual-scroller.css')

export default {
  title: 'Dataset/DatasetGrid',
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
} as Meta<typeof Grid>

// DEFAULT
const thumbnails = [
  '/static/test.png',
  '/static/test.png',
  '/static/test.png'
]

const sfhDataset: DatasetPayload = sfh
sfhDataset.thumbnails = thumbnails

const generateItems = (n: number): any[] => {
  const items = []
  for (let i = 1; i <= n; i++) {
    items.push({
      id: `${items.length + i}`,
      data: sfhDataset
    })
  }
  return items
}

const datasetItems = generateItems(100)

export const Default: Story<GridProps> = (args, { argTypes }) => ({
  components: { DatasetCardV2, Grid },
  props: Object.keys(argTypes),
  store,
  beforeMount () {
    store.commit('dataset/RESET_ALL')
    store.commit('dataset/PUSH_DATASET_ITEMS', datasetItems)
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
    store.commit('auth/RESET_ALL')
  },
  data: () => ({
    selectedDataset: sfhDataset
  }),
  template: `
    <div style="height:500px;">
      <grid v-bind="$props"">
        <template #card="{ item: { data }  }">
          <dataset-card-v2
            :id="data.id"
            :key="data.id"
            :dataset="data"
            @click="$emit('update:selectedDataset', data)"
          />
        </template>
        <template #skeleton="{ item }">
          <div style="width:100%;height:200px;background:hsla(220, 17%, 91%, 1);">
          </div>
        </template>
      </grid>
    </div>
  `
})

Default.args = {
  items: datasetItems
}
