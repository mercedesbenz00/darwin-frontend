import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import { v4 } from 'uuid'
import Vue from 'vue'
import VueVirtualScroller from 'vue-virtual-scroller'

import {
  buildDatasetImagePayload,
  buildDatasetItemPayload, buildImagePayload
} from 'test/unit/factories'
import { buildV2DatasetFolderPayload } from 'test/unit/factories/buildV2DatasetFolderPayload'

import { TableProps } from '@/components/Common/Table/V2/Table/types'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'

import CustomTable from './CustomTable.vue'

let wrapper: Wrapper<Vue>
const localVue = createLocalVue()
localVue.use(VueVirtualScroller)

const data: TableProps['data'] = []

const propsData: TableProps = {
  tableId: '123',
  data,
  headerRow: [
    {
      id: 'name',
      label: 'Name',
      minColumnSize: 100,
      sortAction: () => {},
      tableId: '123',
      totalItems: 5
    },
    {
      id: 'age',
      label: 'Age',
      minColumnSize: 100,
      sortAction: () => {},
      tableId: '123',
      totalItems: 5
    },
    {
      id: 'address',
      label: 'Address',
      minColumnSize: 100,
      sortAction: () => {},
      tableId: '123',
      totalItems: 5
    },
    {
      id: 'birth',
      label: 'Birthday',
      minColumnSize: 100,
      sortAction: () => {},
      tableId: '123',
      totalItems: 5
    },
    {
      id: 'grade',
      label: 'Grade',
      minColumnSize: 100,
      sortAction: () => {},
      tableId: '123',
      totalItems: 5
    }
  ]
}

beforeEach(() => {
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
    })
  }

  wrapper = shallowMount(CustomTable, { propsData, localVue })
})

afterEach(() => {
  wrapper.destroy()
})

it('should render properly', () => {
  expect(wrapper.exists()).toBeTruthy()
})

it('should match snapshot', () => {
  expect(wrapper).toMatchSnapshot()
})
