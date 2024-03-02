import { shallowMount, createLocalVue, Stubs } from '@vue/test-utils'

import { buildDatasetFolderPayload, buildDatasetPayload } from 'test/unit/factories'

import WorkflowFolderCrumbs from '@/components/WorkView/WorkflowFilter/WorkflowFolderCrumbs.vue'
import { DatasetFolderPayload, DatasetPayload } from '@/store/types'

const localVue = createLocalVue()

const mocks = { $route: { query: {} } }
const stubs: Stubs = { 'router-link': true }
let propsData: {
  dataset: DatasetPayload
  folders: DatasetFolderPayload[]
  currentPath: string
}

const folder2 = buildDatasetFolderPayload({ path: '/test1/test2' })
const folder1 = buildDatasetFolderPayload({ path: '/test1', children: [folder2] })
const rootFolder = buildDatasetFolderPayload({ path: '/', children: [folder1] })

beforeEach(() => {
  propsData = {
    dataset: buildDatasetPayload({ name: 'SFH' }),
    folders: [rootFolder],
    currentPath: '/'
  }
})

it('matches snapshot when in root path', () => {
  const wrapper = shallowMount(WorkflowFolderCrumbs, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when in subfolder', () => {
  propsData.currentPath = folder2.path
  const wrapper = shallowMount(WorkflowFolderCrumbs, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})
