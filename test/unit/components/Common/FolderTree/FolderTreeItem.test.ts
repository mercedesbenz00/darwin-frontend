import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'

import { buildDatasetFolderPayload } from 'test/unit/factories'

import FolderTreeItem from '@/components/Common/FolderTree/FolderTreeItem.vue'
import { DatasetFolderPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('close-popover', () => {})
localVue.use(VTooltip, { defaultHtml: true })

let folder: DatasetFolderPayload

beforeEach(() => {
  folder = buildDatasetFolderPayload({
    path: '/root',
    children: [
      buildDatasetFolderPayload({ path: '/root/test1' }),
      buildDatasetFolderPayload({ path: '/root/test2' })
    ]
  })
})

it('matches snapshot', () => {
  const propsData = { folder }
  const wrapper = shallowMount(FolderTreeItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits select when you click on parent folder', () => {
  const propsData = { folder }
  const wrapper = shallowMount(FolderTreeItem, { localVue, propsData })
  wrapper.find('.folder-tree__item__info').trigger('click')
  expect(wrapper.emitted().select).toEqual([[folder]])
})

it('emits select when you click on sub folder', () => {
  const propsData = { folder }
  const wrapper = shallowMount(FolderTreeItem, { localVue, propsData })
  wrapper.find('folder-tree-stub').vm.$emit('select', folder.children![0])
  expect(wrapper.emitted().select).toEqual([[folder.children![0]]])
})
