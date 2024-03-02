import { createLocalVue, shallowMount } from '@vue/test-utils'

import {
  assigneeOption,
  imageFilenameOption,
  folderOption
} from 'test/unit/fixtures/generic-filter-options'
import { emitRootStub } from 'test/unit/testHelpers'

import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter/types'
import { TriToggleStatus } from '@/utils'

import GenericFilterOptionContent from './GenericFilterOptionContent.vue'

const localVue = createLocalVue()
let propsData: {
  option: GenericFilterOptionType,
  status?: TriToggleStatus
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(GenericFilterOptionContent, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

const itEmitsPositive = () => it('emits toggle positive', async () => {
  propsData.status = 'none'
  const wrapper = shallowMount(GenericFilterOptionContent, { localVue, propsData })
  await emitRootStub(wrapper, 'update:status', 'positive')
  await emitRootStub(wrapper, 'toggle', { shiftKey: false })
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().toggle).toEqual([['positive']])
})

const itEmitsShiftPositive = () => it('emits shift-toggle positive', async () => {
  propsData.status = 'none'
  const wrapper = shallowMount(GenericFilterOptionContent, { localVue, propsData })
  await emitRootStub(wrapper, 'update:status', 'positive')
  await emitRootStub(wrapper, 'toggle', { shiftKey: true })
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted()['shift-toggle']).toEqual([['positive']])
})

const itEmitsNegative = () => it('emits toggle negative', async () => {
  propsData.status = 'positive'
  const wrapper = shallowMount(GenericFilterOptionContent, { localVue, propsData })
  await emitRootStub(wrapper, 'update:status', 'negative')
  await emitRootStub(wrapper, 'toggle', {})
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().toggle).toEqual([['negative']])
})

describe('assignee option', () => {
  beforeEach(() => {
    propsData = { option: assigneeOption }
  })

  describe('when positive', () => {
    beforeEach(() => { propsData.status = 'positive' })

    itMatchesSnapshot()
    itEmitsNegative()
  })

  describe('when none', () => {
    beforeEach(() => { propsData.status = 'none' })

    itMatchesSnapshot()
    itEmitsPositive()
    itEmitsShiftPositive()
  })
})

describe('filename option', () => {
  beforeEach(() => {
    propsData = { option: imageFilenameOption }
  })

  describe('when positive', () => {
    beforeEach(() => { propsData.status = 'positive' })

    itMatchesSnapshot()
    itEmitsNegative()
  })

  describe('when none', () => {
    beforeEach(() => { propsData.status = 'none' })

    itMatchesSnapshot()
    itEmitsPositive()
    itEmitsShiftPositive()
  })
})

describe('folder option', () => {
  beforeEach(() => {
    propsData = { option: folderOption }
  })

  describe('when positive', () => {
    beforeEach(() => { propsData.status = 'positive' })

    itMatchesSnapshot()
    itEmitsNegative()
  })

  describe('when none', () => {
    beforeEach(() => { propsData.status = 'none' })

    itMatchesSnapshot()
    itEmitsPositive()
    itEmitsShiftPositive()
  })
})
