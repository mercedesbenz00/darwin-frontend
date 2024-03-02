import { createLocalVue, shallowMount, mount, Wrapper } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import WorkflowStats from '@/components/Workflow//WorkflowStats.vue'

import { Progress } from './types'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

type WorkflowStatsProp = {
  value: Progress,
}

let propsData: WorkflowStatsProp

const itMatchesSnapshot = (propsData: WorkflowStatsProp): void => it('matches snapshot', () => {
  const wrapper = mount(WorkflowStats, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

const progress = {
  total: 10000,
  complete: 1000,
  in_progress: 9000,
  idle: 0
}

itMatchesSnapshot({
  value: progress
})

it('is instanciated', () => {
  const _propsData = { value: progress }

  const wrapper = shallowMount(WorkflowStats, { localVue, propsData: _propsData })
  expect(wrapper).toBeTruthy()
})

describe('when correct props are used', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = { value: progress }

  beforeEach(() => {
    propsData = _propsData
    wrapper = mount(WorkflowStats, { localVue, propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)

  it('should show correct progress items', () => {
    const attributeStack = wrapper
      .find('.workflow-card__stats__attribute-stack__items')
      .find('.attribute-stack')
    expect(attributeStack.find('.attribute-stack__label--primary').text()).toBe('10.0k')
  })

  it('should show correct progress complete', () => {
    const attributeStack = wrapper
      .find('.workflow-card__stats__attribute-stack__complete')
      .find('.attribute-stack')
    expect(attributeStack.find('.attribute-stack__label--primary').text()).toBe('1000')
  })

  it('should show correct progress complete', () => {
    const attributeStack = wrapper
      .find('.workflow-card__stats__attribute-stack__in-progress')
      .find('.attribute-stack')
    expect(attributeStack.find('.attribute-stack__label--primary').text()).toBe('9000')
  })

  it('should show correct progress percentage', () => {
    const progress = wrapper.find('.workflow-card__stats__progress')
    expect(progress.find('.workflow-card__stats__progress__label').text()).toBe('10.0%')
  })
})
