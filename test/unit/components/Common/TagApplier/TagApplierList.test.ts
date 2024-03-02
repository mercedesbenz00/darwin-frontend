import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { tag } from 'test/unit/fixtures/annotation-class-payloads'
import { VueTagsInput } from 'test/unit/stubs'

import TagApplierList from '@/components/Common/TagApplier/TagApplierList.vue'
import { AnnotationClassPayload, InputTag } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('click-outside', () => {})

let propsData: {
  currentTags: InputTag[]
  datasetTags: AnnotationClassPayload[]
  tag: string
  canCreateTags?: boolean
  disabled?: boolean
}
const stubs: Stubs = { VueTagsInput }

beforeEach(() => {
  propsData = {
    currentTags: [],
    datasetTags: [tag],
    tag: '',
    canCreateTags: true,
    disabled: false
  }
})

describe('with default props', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(TagApplierList, { localVue, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('should add an existing tag when clicked', async () => {
    const wrapper = shallowMount(TagApplierList, { localVue, propsData, stubs })
    await wrapper.findAll('.tag-applier-list__tag').at(0).trigger('click')
    expect(wrapper.emitted()['add-tag']).toEqual([[tag]])
  })
})

describe('with selected tags', () => {
  beforeEach(() => {
    propsData.currentTags = [{ text: tag.name }]
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(TagApplierList, { localVue, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('with tag text', () => {
  beforeEach(() => {
    propsData.tag = 'new-tag'
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(TagApplierList, { localVue, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('should emit create-tag when you click on create button', async () => {
    const wrapper = shallowMount(TagApplierList, { localVue, propsData, stubs })
    await wrapper.find('.tag-applier-list__create').trigger('click')
    expect(wrapper.emitted()['create-tag']).toEqual([[{ text: 'new-tag' }]])
  })
})

describe('when disabled', () => {
  beforeEach(() => {
    propsData.disabled = true
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(TagApplierList, { localVue, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when cannot create tag', () => {
  beforeEach(() => {
    propsData.canCreateTags = false
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(TagApplierList, { localVue, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})
