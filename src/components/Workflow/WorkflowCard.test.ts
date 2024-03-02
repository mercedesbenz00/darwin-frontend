import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import WorkflowCard from '@/components/Workflow/WorkflowCard.vue'
import { V2WorkflowPayload } from '@/store/types'
import { workflowBuilder } from '@/storybook/fixtures/__mocks__/workflow/workflow'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.directive('click-outside', stubDirectiveWithAttribute)

const stubs = {
  'router-link': true
}
const mocks: {
  $can: Function,
  $route: { path: string }
} = {
  $can: jest.fn().mockReturnValue(true),
  $route: { path: '' }
}

type WorkflowCardProp = {
  data: V2WorkflowPayload,
  disableMenu?: boolean,
  selectable?: boolean,
  selected?: boolean
}

const workflow: V2WorkflowPayload = workflowBuilder({
  inserted_at: '2022-01-01T01:01:01',
  updated_at: '2022-02-02T02:02:02',
  status: 'running',
  thumbnails: ['/static/test.png', '/static/test.png', '/static/test.png'],
  progress: {
    idle: 0,
    total: 11123,
    complete: 11000,
    in_progress: 123
  }
})

let propsData: WorkflowCardProp = {
  data: workflow,
  disableMenu: false,
  selectable: false,
  selected: false
}

const itMatchesSnapshot = (propsData: WorkflowCardProp): void => it('matches snapshot', () => {
  const wrapper = shallowMount(WorkflowCard, { localVue, propsData, mocks, stubs })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot({
  data: workflow,
  disableMenu: false,
  selectable: false,
  selected: false
})

it('is instanciated', () => {
  const wrapper = shallowMount(WorkflowCard, { localVue, mocks, stubs, propsData })
  expect(wrapper).toBeTruthy()
})

it('should render as a div', () => {
  const wrapper = shallowMount(WorkflowCard, { localVue, mocks, stubs, propsData })
  expect(wrapper.vm.$el.tagName === 'DIV').toBe(true)
})

it('should have the right to attribute', () => {
  const wrapper = shallowMount(WorkflowCard, { localVue, mocks, stubs, propsData })
  const customButton = wrapper.find('.workflow-card__actions').find('custom-button-stub')
  expect(customButton.attributes().to).toBe(`/workflows/${propsData.data.id}`)
})

describe('when passed a list of thumbnails', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    wrapper = shallowMount(WorkflowCard, { localVue, mocks, stubs, propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(propsData)

  it('renders correctly', () => {
    expect(wrapper.find('.workflow-card').exists()).toBe(true)
    expect(wrapper.find('.workflow-card__upside').exists()).toBe(true)
    expect(wrapper.find('.workflow-card__details').exists()).toBe(true)
    expect(wrapper.find('.workflow-card__downside').exists()).toBe(true)
  })
})

describe('when name is short', () => {
  let wrapper: Wrapper<Vue>

  const name = 'short-name'

  const _propsData = {
    ...propsData,
    data: {
      ...workflow,
      name
    }
  }

  beforeEach(() => {
    propsData = _propsData
    wrapper = shallowMount(WorkflowCard, { localVue, mocks, stubs, propsData: _propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)

  it('should contain the name non-truncated', () => {
    expect(wrapper.find('.workflow-card__details__name').text()).toBe(name)
  })
})

describe('when name is long (above 64 characters)', () => {
  let wrapper: Wrapper<Vue>

  const name = 'very-loooooooooooooooooooooooooooooooooooooooooooooooooooooong-name'

  const _propsData = {
    ...propsData,
    data: {
      ...workflow,
      name
    }
  }

  beforeEach(() => {
    propsData = _propsData
    wrapper = shallowMount(WorkflowCard, { localVue, mocks, stubs, propsData: _propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)

  it('should contain the name non-truncated', () => {
    expect(wrapper.find('.workflow-card__details__name').text()).toBe(`${name.slice(0, -6)}...`)
  })
})

describe('when menu is not disabled', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = {
    ...propsData,
    disableMenu: false
  }

  beforeEach(() => {
    propsData = _propsData
    wrapper = shallowMount(WorkflowCard, { localVue, mocks, stubs, propsData: _propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)

  it('should render the menu button and dropdown', () => {
    expect(wrapper.find('.workflow-card__details__more').exists()).toBe(true)
  })
})

describe('when menu is disabled', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = {
    ...propsData,
    disableMenu: true
  }

  beforeEach(() => {
    propsData = _propsData
    wrapper = shallowMount(WorkflowCard, { localVue, mocks, stubs, propsData: _propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)

  it('should render the menu button and dropdown', () => {
    expect(wrapper.find('.workflow-card__details__more').exists()).toBe(false)
  })
})
