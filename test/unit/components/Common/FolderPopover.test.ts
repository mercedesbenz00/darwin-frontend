import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { buildDatasetFolderPayload, buildDatasetPayload } from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import FolderPopover from '@/components/Common/FolderPopover.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import { DatasetFolderPayload, DatasetPayload } from '@/store/types'

const localVue = createLocalVue()

let dataset: DatasetPayload
let folders: DatasetFolderPayload[]
let propsData: {
  dataset: DatasetPayload
  folders: DatasetFolderPayload[]
  loading?: boolean
  disabled?: boolean
}
const stubs: Stubs = { InputField, VPopover }

beforeEach(() => {
  dataset = buildDatasetPayload({ id: 1, name: 'Test' })
  folders = [
    buildDatasetFolderPayload({
      path: '/',
      direct_item_count_filtered: 1,
      dataset_id: dataset.id,
      children: [
        buildDatasetFolderPayload({
          path: '/test',
          direct_item_count_filtered: 2,
          dataset_id: dataset.id
        })
      ]
    })
  ]
  propsData = {
    dataset,
    folders
  }
})

describe('with default props', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(FolderPopover, { localVue, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('emits move when you click on folder button', async () => {
    const wrapper = shallowMount(FolderPopover, { localVue, propsData, stubs })
    const inputField = wrapper.find('input') as any
    inputField.element.value = 'folder'
    await inputField.trigger('input')
    await wrapper.find('.folder-popover__create').trigger('click')
    expect(wrapper.emitted().move).toEqual([['/folder']])
  })

  it('emits move when you click on root folder button', async () => {
    const wrapper = shallowMount(FolderPopover, { localVue, propsData, stubs })
    await wrapper.find('.folder-popover__folders__root').trigger('click')
    expect(wrapper.emitted().move).toEqual([['/']])
  })

  it('emits move when you click on root folder button', async () => {
    const wrapper = shallowMount(FolderPopover, { localVue, propsData, stubs })
    await wrapper.find('folder-tree-stub').vm.$emit('select', folders[0])
    expect(wrapper.emitted().move).toEqual([[folders[0].path]])
  })
})

describe('when loading', () => {
  beforeEach(() => {
    propsData.loading = true
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(FolderPopover, { localVue, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when disabled', () => {
  beforeEach(() => {
    propsData.disabled = true
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(FolderPopover, { localVue, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})
