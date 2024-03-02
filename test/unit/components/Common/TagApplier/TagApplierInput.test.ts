import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { VueTagsInput } from 'test/unit/stubs'

import TagApplierInput from '@/components/Common/TagApplier/TagApplierInput.vue'
import { AddTagPayload, RemoveTagPayload } from '@/components/Common/TagApplier/types'
import { InputTag } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('click-outside', () => {})

let propsData: {
  currentTags: InputTag[]
  tag: string
  disabled?: boolean
}
const stubs: Stubs = { VueTagsInput }

beforeEach(() => {
  propsData = {
    currentTags: [{ text: 'tag1' }],
    tag: ''
  }
})

describe('when not disabled', () => {
  beforeEach(() => {
    propsData.disabled = false
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(TagApplierInput, { localVue, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('should emit new-tag when new tag is added', async () => {
    const wrapper = shallowMount(TagApplierInput, { localVue, propsData, stubs })
    const addTagPayload: AddTagPayload = {
      tag: { text: 'tag2' },
      addTag: () => {}
    }
    await wrapper.find('.vue-tags-input-stub').vm.$emit('before-adding-tag', addTagPayload)
    expect(wrapper.emitted()['new-tag']).toEqual([[addTagPayload, undefined]])
  })

  it('should emit remove-tag when tag is removed', async () => {
    const wrapper = shallowMount(TagApplierInput, { localVue, propsData, stubs })
    const removeTagPayload: RemoveTagPayload = {
      tag: { text: 'tag2' },
      deleteTag: () => {}
    }
    await wrapper.find('.vue-tags-input-stub').vm.$emit('before-deleting-tag', removeTagPayload)
    expect(wrapper.emitted()['remove-tag']).toEqual([[removeTagPayload]])
  })
})

describe('when disabled', () => {
  beforeEach(() => {
    propsData.disabled = true
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(TagApplierInput, { localVue, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})
