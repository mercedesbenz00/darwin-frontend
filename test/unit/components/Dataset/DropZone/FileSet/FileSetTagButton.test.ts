import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { buildDatasetPayload } from 'test/unit/factories'
import { emitRootStub } from 'test/unit/testHelpers'

import FileSetTagButton from '@/components/Dataset/DropZone/FileSet/FileSetTagButton.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()

let dataset: DatasetPayload
let propsData: {
  dataset: DatasetPayload
  tags: string[]
}
const stubs: Stubs = {
  TagsPopover: {
    template: '<div class="tags-popover"><slot /></div>'
  }
}

beforeEach(() => {
  dataset = buildDatasetPayload({ id: 1 })
  propsData = {
    dataset,
    tags: ['tag1', 'tag2']
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(FileSetTagButton, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('should emit "set-folder" when tags is selected', async () => {
  const wrapper = shallowMount(FileSetTagButton, { localVue, propsData, stubs })
  await emitRootStub(wrapper, 'change', ['tag2', 'tag3'])
  expect(wrapper.emitted()['set-tags']).toEqual([[['tag2', 'tag3']]])
})
