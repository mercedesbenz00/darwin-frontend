import { shallowMount, createLocalVue } from '@vue/test-utils'
import { clear } from 'jest-date-mock'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetExportPayload,
  buildDatasetPayload
} from 'test/unit/factories'

import V2DatasetExportVersionList from '@/components/DatasetExport/V2DatasetExportVersionList.vue'
import { IsAuthorized } from '@/store/modules/auth/getters/isAuthorized'
import { DatasetExportPayload, DatasetPayload } from '@/store/types'

const localVue = createLocalVue()

let store: ReturnType<typeof createTestStore>

const datasetExport = buildDatasetExportPayload({
  name: 'version1'
})

let mocks: { $can: IsAuthorized }

const dataset = buildDatasetPayload({ id: 1 })

let propsData: {
  availableExports: DatasetExportPayload[],
  dataset: DatasetPayload,
  isOpenMode: boolean
}

beforeEach(() => {
  propsData = {
    availableExports: [datasetExport],
    dataset,
    isOpenMode: false
  }

  mocks = {
    $can: (ability) => {
      if (!['export_dataset', 'view_dataset_exports'].includes(ability)) {
        throw new Error(`Component is checking unexpected ability: ${ability}`)
      }

      return true
    }
  }
})

afterEach(() => clear)

it('matches snapshot', () => {
  const wrapper = shallowMount(V2DatasetExportVersionList, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
