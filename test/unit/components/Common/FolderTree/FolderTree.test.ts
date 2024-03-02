import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildDatasetFolderPayload } from 'test/unit/factories'

import FolderTree from '@/components/Common/FolderTree/FolderTree.vue'

const localVue = createLocalVue()

const folders = [
  buildDatasetFolderPayload({ path: '/' }),
  buildDatasetFolderPayload({ path: '/test' })
]

it('matches snapshot', () => {
  const propsData = { folders }
  const wrapper = shallowMount(FolderTree, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits select when you click on folder item', () => {
  const propsData = { folders }
  const wrapper = shallowMount(FolderTree, { localVue, propsData })
  wrapper.find('folder-tree-item-stub').vm.$emit('select', folders[0])
  expect(wrapper.emitted().select).toEqual([[folders[0]]])
})
