import { Meta, Story } from '@storybook/vue'
import { v4 } from 'uuid'
import Vue from 'vue'

import {
  buildAnnotationClassPayload,
  buildDatasetImagePayload,
  buildDatasetItemPayload,
  buildImagePayload
} from 'test/unit/factories'
import { buildV2DatasetFolderPayload } from 'test/unit/factories/buildV2DatasetFolderPayload'

import TableRowContentLoader from '@/components/Common/LoadingIndicators/ContentLoaders/Other/TableRow/TableRow.vue'
import { TableFolder } from '@/components/Common/Table/V2/TableFolder'
import TableItem from '@/components/Common/Table/V2/TableItem/TableItem.vue'
import TableRow from '@/components/Common/Table/V2/TableRow/TableRow.vue'
import DatasetItemListItem from '@/components/DatasetManagement/ListItem/DatasetItemListItem/V2/DatasetItemListItem.vue'
import store, { resetStore } from '@/store'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { V2DatasetFolderPayload } from '@/store/types/V2DatasetFolderPayload'

import CustomTable from './CustomTable.vue'
import { TableProps } from './types'

export default {
  title: 'Common/Table/V2/Table',
  argTypes: {}
} as Meta<typeof CustomTable>

const data: TableProps['data'] = []

const datasetItems: DatasetItemPayload[] = []

const tableId = v4()

const setupStore = (vm: Vue): void => {
  resetStore()
  const store = vm.$store

  const aclass1 = buildAnnotationClassPayload({ id: 1 })
  const aclass2 = buildAnnotationClassPayload({
    id: 2,
    name: 'Desk'
  })

  for (let i = 0; i < 5; i++) {
    data.push({
      id: v4(),
      data: buildV2DatasetFolderPayload({
        dataset_id: i,
        path: `/folder_${i}`,
        filtered_item_count: 100,
        unfiltered_item_count: 100
      })
    })
  }

  for (let i = 0; i < 100; i++) {
    datasetItems.push(
      buildDatasetItemPayload({
        labels: [1, 2],
        dataset_id: 1,
        dataset_image_id: 1,
        dataset_video_id: null,
        filename: 'logo-2.jpg',
        id: i,
        status: DatasetItemStatus.complete,
        dataset_image: {
          ...buildDatasetImagePayload({
            id: 1,
            dataset_id: 1,
            image: buildImagePayload({
              id: 1,
              url:
                // eslint-disable-next-line max-len
                'https://res.cloudinary.com/polygonxyz/image/upload/w_100/polygon/mock-img/xray01.jpg',
              external: true,
              thumbnail_url:
                // eslint-disable-next-line max-len
                'https://res.cloudinary.com/polygonxyz/image/upload/w_100/polygon/mock-img/xray01.jpg',
              height: 100,
              width: 100,
              original_filename: 'logo-2.png'
            })
          })
        }
      })
    )

    data.push({
      id: v4(),
      data: buildDatasetItemPayload({
        labels: [1, 2],
        dataset_id: 1,
        dataset_image_id: 1,
        dataset_video_id: null,
        filename: 'logo-2.jpg',
        id: i,
        status: DatasetItemStatus.complete,
        dataset_image: {
          ...buildDatasetImagePayload({
            id: 1,
            dataset_id: 1,
            image: buildImagePayload({
              id: 1,
              url:
                // eslint-disable-next-line max-len
                'https://res.cloudinary.com/polygonxyz/image/upload/w_100/polygon/mock-img/xray01.jpg',
              external: true,
              thumbnail_url:
                // eslint-disable-next-line max-len
                'https://res.cloudinary.com/polygonxyz/image/upload/w_100/polygon/mock-img/xray01.jpg',
              height: 100,
              width: 100,
              original_filename: 'logo-2.png'
            })
          })
        }
      })
    })
  }

  store.commit('aclass/PUSH_CLASS', aclass1)
  store.commit('aclass/PUSH_CLASS', aclass2)
  store.commit('dataset/PUSH_DATASET_ITEMS', datasetItems)
}

export const Default: Story<TableProps> = (args, { argTypes }) => ({
  components: {
    CustomTable,
    TableRow,
    TableItem,
    TableFolder,
    DatasetItemListItem,
    TableRowContentLoader
  },
  props: Object.keys(argTypes),
  store,
  mounted (): void {
    setupStore((this as unknown) as Vue)
  },
  methods: {
    isFolder (entity: V2DatasetFolderPayload | DatasetItemPayload): boolean {
      if ('filtered_item_count' in entity) { return true }

      return false
    }
  },
  template: `
    <div style='display:block;width:65%;height:80vh;overflow:hidden'>
      <custom-table v-bind='$props'>
        <template #default='{ item, index }'>
          <table-folder
            v-if='isFolder(item.data)'
            :id='$props.tableId'
            :label='item.data.path'
            :suffix-label='item.data.unfiltered_item_count'
          >
          </table-folder>
          <dataset-item-list-item
            v-else :table-id='$props.tableId' :data='item.data' :row='index'
          />
        </template>
      </custom-table>
    </div>
  `
})

Default.storyName = 'Base Table'
Default.args = {
  tableId,
  data,
  headerRow: [
    {
      id: 'name',
      label: 'Name',
      minColumnSize: 312,
      sortAction: () => {},
      tableId,
      totalItems: 6
    },
    {
      id: 'status',
      label: 'Status',
      minColumnSize: 200,
      sortAction: () => {},
      tableId,
      totalItems: 6
    },
    {
      id: 'tags',
      label: 'Tags',
      minColumnSize: 200,
      sortAction: () => {},
      tableId,
      totalItems: 6
    },
    {
      id: 'created_at',
      label: 'Date Created',
      minColumnSize: 136,
      sortAction: () => {},
      tableId,
      totalItems: 6
    },
    {
      id: 'updated_at',
      label: 'Date Modified',
      minColumnSize: 136,
      sortAction: () => {},
      tableId,
      totalItems: 6
    },
    {
      id: 'byte_size',
      label: 'File Size',
      minColumnSize: 136,
      sortAction: () => {},
      tableId,
      totalItems: 6
    }
  ]
}

export const LoadingTable: Story<TableProps> = (args, { argTypes }) => ({
  components: { CustomTable, TableRowContentLoader },
  props: Object.keys(argTypes),
  template: `
    <div style='display:block;width:80%;height:auto;overflow:hidden'>
      <custom-table v-bind='$props'>
        <template #loading>
          <table-row-content-loader v-for='n in 4' :key='n' :table-id='$props.tableId' />
        </template>
      </custom-table>
    </div>
  `
})

LoadingTable.storyName = 'Loading Table'
LoadingTable.args = {
  tableId: v4(),
  headerRow: [
    {
      id: '1',
      label: 'Name',
      minColumnSize: 312,
      sortAction: () => {},
      tableId,
      totalItems: 6
    },
    {
      id: '2',
      label: 'Status',
      minColumnSize: 200,
      sortAction: () => {},
      tableId,
      totalItems: 6
    },
    {
      id: '3',
      label: 'Tags',
      minColumnSize: 200,
      sortAction: () => {},
      tableId,
      totalItems: 6
    },
    {
      id: '4',
      label: 'Date Created',
      minColumnSize: 136,
      sortAction: () => {},
      tableId,
      totalItems: 6
    },
    {
      id: '5',
      label: 'Date Modified',
      minColumnSize: 136,
      sortAction: () => {},
      tableId,
      totalItems: 6
    },
    {
      id: '6',
      label: 'File Size',
      minColumnSize: 136,
      sortAction: () => {},
      tableId,
      totalItems: 6
    }
  ]
}
