import { Meta, Story } from '@storybook/vue'
import { v4 } from 'uuid'
import Vue from 'vue'

import {
  buildAnnotationClassPayload,
  buildDatasetImagePayload,
  buildDatasetItemPayload,
  buildImagePayload
} from 'test/unit/factories'

import { CustomTable } from '@/components/Common/Table/V2/Table'
import GalleryDatasetItem from '@/components/DatasetManagement/mixins/GalleryDatasetItem'
import store, { resetStore } from '@/store'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'

import DatasetItemListItem from './DatasetItemListItem.vue'

export default {
  title: 'DatasetManagement/DatasetItemListItem'
} as Meta<typeof DatasetItemListItem>

const datasetItems = [
  buildDatasetItemPayload({
    labels: [1, 2],
    dataset_id: 1,
    dataset_image_id: 1,
    dataset_video_id: null,
    filename: 'logo-2.jpg',
    id: 1,
    status: DatasetItemStatus.complete,
    dataset_image: {
      ...buildDatasetImagePayload({
        id: 1,
        dataset_id: 1,
        image: buildImagePayload({
          id: 1,
          url:
            'https://res.cloudinary.com/polygonxyz/image/upload/w_100/polygon/mock-img/xray01.jpg',
          external: true,
          thumbnail_url:
            'https://res.cloudinary.com/polygonxyz/image/upload/w_100/polygon/mock-img/xray01.jpg',
          height: 100,
          width: 100,
          original_filename: 'logo-2.png'
        })
      })
    }
  })
]

const setupStore = (vm: Vue): void => {
  resetStore()
  const store = vm.$store

  const aclass1 = buildAnnotationClassPayload({ id: 1 })
  const aclass2 = buildAnnotationClassPayload({ id: 2, name: 'Desk' })

  store.commit('aclass/PUSH_CLASS', aclass1)
  store.commit('aclass/PUSH_CLASS', aclass2)
  store.commit('dataset/PUSH_DATASET_ITEMS', datasetItems)
}

export const Default: Story = (args, { argTypes }) => ({
  components: {
    CustomTable,
    DatasetItemListItem
  },
  props: Object.keys(argTypes),
  store,
  mounted (): void {
    setupStore((this as unknown) as Vue)
  },
  mixins: [GalleryDatasetItem],
  template: `
    <custom-table v-bind='$props'>
      <dataset-item-list-item
        :tableId='$props.tableId'
        :data='$props.data'
      />
    </custom-table>
  `
})

Default.storyName = 'DatasetItemListItem'
Default.args = {
  tableId: v4(),
  headerRow: [
    {
      label: 'Name',
      minColumnSize: 312,
      sortAction: () => {}
    },
    {
      label: 'Status',
      minColumnSize: 200,
      sortAction: () => {}
    },
    {
      label: 'Tags',
      minColumnSize: 200,
      sortAction: () => {}
    },
    {
      label: 'Date Created',
      minColumnSize: 136,
      sortAction: () => {}
    },
    {
      label: 'Date Modified',
      minColumnSize: 136,
      sortAction: () => {}
    },
    {
      label: 'File Size',
      minColumnSize: 136,
      sortAction: () => {}
    }
  ],
  data: datasetItems[0]
}
