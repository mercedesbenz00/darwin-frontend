import { Meta, Story } from '@storybook/vue'
import RouteMock from 'storybook-vue-router'

import colors from '@/assets/styles/darwin/variables/colors.module.scss'
import { DatasetItemCardProps } from '@/components/DatasetManagement/Card/V2/types'
import store from '@/store'
import { DatasetItemPayload, DatasetItemStatus } from '@/store/types'
import { blurry } from '@/storybook/fixtures/annotationClasses'
import { datasetItemBuilder } from '@/storybook/fixtures/datasetItems'

import DatasetItemCard from './DatasetItemCard.vue'

export default {
  title: 'DatasetManagement/DatasetItemCard',
  argTypes: {
    data: {
      control: 'object',
      description: 'Item card data'
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
} as Meta<typeof DatasetItemCard>

const thumbnailUrl = '/static/test.png'

const tag1 = {
  ...blurry,
  id: 1,
  name: 'Sitting',
  metadata: { _color: 'rgba(201,44,122,1)' }
}

const tag2 = {
  ...blurry,
  id: 2,
  name: 'Running',
  metadata: { _color: 'rgba(64,181,181,1)' }
}

// DEFAULT
const datasetItem: DatasetItemPayload = datasetItemBuilder({
  inserted_at: '2022-01-01T01:01:01',
  updated_at: '2022-02-02T02:02:02',
  status: DatasetItemStatus.archived,
  labels: [1, 2]
})
if (datasetItem.dataset_image) {
  datasetItem.dataset_image.image.thumbnail_url = thumbnailUrl
}

export const Default: Story<DatasetItemCardProps> = (args, { argTypes }) => ({
  components: { DatasetItemCard },
  props: Object.keys(argTypes),
  store,
  beforeMount () {
    store.commit('aclass/SET_CLASSES', [tag1, tag2])
  },
  data: () => ({
    datasetItem
  }),
  template: `
    <div style='width:200px;'>
    <dataset-item-card
      :data='datasetItem'
      @select='onSelect(data, $event)'
      @shift-select='onSelect(data, $event)'
    />
    </div>
  `,
  methods: {
    onSelect (item: DatasetItemPayload, selected: boolean) {
      store.commit('dataset/UPDATE_ITEM_SELECTION', {
        items: [item],
        selected
      })
    }
  }
})

Default.args = {
  data: datasetItem
}
