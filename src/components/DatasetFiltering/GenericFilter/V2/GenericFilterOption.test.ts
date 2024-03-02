import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import {
  assigneeOption,
  imageFilenameOption,
  firstAssigneeOption,
  firstFilenameOption,
  firstFolderOption,
  folderOption
} from 'test/unit/fixtures/generic-filter-options'
import { GenericFilterHeader } from 'test/unit/stubs'
import { emitRootStub } from 'test/unit/testHelpers'

import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter/types'
import { TriToggleStatus } from '@/utils'

import GenericFilterOption from './GenericFilterOption.vue'

const localVue = createLocalVue()
const stubs: Stubs = {
  GenericFilterHeader
}
let propsData: {
  option: GenericFilterOptionType,
  status?: TriToggleStatus
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(GenericFilterOption, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

const itEmitsPositive = (isFirstOption: boolean) => it('emits positive toggle event', async () => {
  const wrapper = shallowMount(GenericFilterOption, { localVue, propsData, stubs })

  if (isFirstOption) {
    await wrapper.find('generic-filter-option-content-stub').vm.$emit('toggle', 'positive')
  } else {
    await emitRootStub(wrapper, 'toggle', 'positive')
  }
  expect(wrapper.emitted().toggle).toEqual([[{
    option: propsData.option,
    status: 'positive'
  }]])

  if (isFirstOption) {
    await wrapper.find('generic-filter-option-content-stub').vm.$emit('shift-toggle', 'positive')
  } else {
    await emitRootStub(wrapper, 'shift-toggle', 'positive')
  }
  expect(wrapper.emitted()['shift-toggle']).toEqual([[{
    option: propsData.option,
    status: 'positive'
  }]])
})

const itEmitsNegative = (isFirstOption: boolean) => it('emits negative toggle event', async () => {
  const wrapper = shallowMount(GenericFilterOption, { localVue, propsData, stubs })

  if (isFirstOption) {
    await wrapper.find('generic-filter-option-content-stub').vm.$emit('toggle', 'negative')
  } else {
    await emitRootStub(wrapper, 'toggle', 'negative')
  }
  expect(wrapper.emitted().toggle).toEqual([[{
    option: propsData.option,
    status: 'negative'
  }]])
})

describe('assignee option', () => {
  describe('the first option', () => {
    beforeEach(() => { propsData = { option: firstAssigneeOption } })

    describe('when positive', () => {
      beforeEach(() => { propsData.status = 'positive' })
      itMatchesSnapshot()
      itEmitsNegative(true)
    })

    describe('when not selected', () => {
      beforeEach(() => { propsData.status = 'negative' })
      itMatchesSnapshot()
      itEmitsPositive(true)
    })
  })

  describe('not first option', () => {
    beforeEach(() => { propsData = { option: assigneeOption } })

    describe('when selected', () => {
      beforeEach(() => { propsData.status = 'positive' })
      itMatchesSnapshot()
      itEmitsNegative(false)
    })

    describe('when not selected', () => {
      beforeEach(() => { propsData.status = 'negative' })
      itMatchesSnapshot()
      itEmitsPositive(false)
    })
  })
})

describe('filenames option', () => {
  describe('the first option', () => {
    beforeEach(() => { propsData = { option: firstFilenameOption } })

    describe('when selected', () => {
      beforeEach(() => { propsData.status = 'positive' })
      itMatchesSnapshot()
      itEmitsNegative(true)
    })

    describe('when not selected', () => {
      beforeEach(() => { propsData.status = 'negative' })
      itMatchesSnapshot()
      itEmitsPositive(true)
    })
  })

  describe('not first option', () => {
    beforeEach(() => { propsData = { option: imageFilenameOption } })

    describe('when selected', () => {
      beforeEach(() => { propsData.status = 'positive' })
      itMatchesSnapshot()
      itEmitsNegative(false)
    })

    describe('when not selected', () => {
      beforeEach(() => { propsData.status = 'negative' })
      itMatchesSnapshot()
      itEmitsPositive(false)
    })
  })
})

describe('paths option', () => {
  describe('the first option', () => {
    beforeEach(() => { propsData = { option: firstFolderOption } })

    describe('when selected', () => {
      beforeEach(() => { propsData.status = 'positive' })
      itMatchesSnapshot()
      itEmitsNegative(true)
    })

    describe('when not selected', () => {
      beforeEach(() => { propsData.status = 'negative' })
      itMatchesSnapshot()
      itEmitsPositive(true)
    })
  })

  describe('not first option', () => {
    beforeEach(() => { propsData = { option: folderOption } })

    describe('when selected', () => {
      beforeEach(() => { propsData.status = 'positive' })
      itMatchesSnapshot()
      itEmitsNegative(false)
    })

    describe('when not selected', () => {
      beforeEach(() => { propsData.status = 'negative' })
      itMatchesSnapshot()
      itEmitsPositive(false)
    })
  })
})
