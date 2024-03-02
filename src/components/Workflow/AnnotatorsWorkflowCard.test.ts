import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildV2WorkflowDatasetPayload, buildV2WorkflowPayload } from 'test/unit/factories'

import { CustomButton } from '@/components/Common/Button/V2'
import Header3 from '@/components/Common/Header3.vue'
import Thumbnails from '@/components/Common/Thumbnails/Thumbnails.vue'
import AnnotatorsWorkflowCard from '@/components/Workflow/AnnotatorsWorkflowCard.vue'
import { V2WorkflowPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.directive('click-outside', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
const stubs = {
  modal: true,
  'router-link': true
}

const mocks = {
  $route: { path: '' }
}

type Workflow = Pick<V2WorkflowPayload, 'assigned_items' | 'dataset' | 'id' | 'name' | 'thumbnails'>

const workflow: Workflow = buildV2WorkflowPayload()

function findCustomButtonByText (
  wrapper: Wrapper<Vue>,
  match: RegExp
): Wrapper<Vue> | undefined {
  const matches = wrapper
    .findAllComponents(CustomButton)
    .filter((customButton: Wrapper<Vue>) =>
      customButton.text().match(match))

  if (matches.length === 0) { return }

  return matches.at(0) as Wrapper<Vue>
}

beforeEach(() => {
  store = createTestStore()
})

it('matches snapshot', () => {
  const propsData = { workflow }
  const wrapper = shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('<thumbnails />', () => {
  it('renders once', () => {
    const propsData = { workflow }
    const wrapper =
      shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })

    expect(wrapper.findAllComponents(Thumbnails).length).toBe(1)
  })

  it('passes the workflow\'s thumbnails as :data', () => {
    const thumbnailsCount: number = Math.round(Math.random() * (10 - 1) + 1) // random in 1..10
    const thumbnails = new Array(thumbnailsCount).fill('foo')
    const propsData = { workflow: { ...workflow, thumbnails } }
    const wrapper =
      shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })

    const thumbnailsComponent = wrapper.findComponent(Thumbnails)
    expect(thumbnailsComponent.props().data).toBe(thumbnails)
  })
})

describe('<header-3 />', () => {
  it('renders once', () => {
    const propsData = { workflow }
    const wrapper =
      shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })

    expect(wrapper.findAllComponents(Header3).length).toBe(1)
  })

  it('renders the full name when it is up to 64 characters long', () => {
    const name = 'a'.repeat(64)
    const propsData = { workflow: { ...workflow, name } }
    const wrapper =
      shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })

    const headerComponent = wrapper.findComponent(Header3)
    expect(headerComponent.text()).toBe(name)
  })

  it('renders the truncated name when it is over 64 characters long', () => {
    const name = 'a'.repeat(65)
    const truncated = `${name.slice(0, -4)}...`
    const propsData = { workflow: { ...workflow, name } }
    const wrapper =
      shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })

    const headerComponent = wrapper.findComponent(Header3)
    expect(headerComponent.text()).toBe(truncated)
  })
})

describe('<custom-button /> reading instructions', () => {
  const text = /read instructions/i

  it('does not render when workflow does not have a dataset', () => {
    const propsData = { workflow: { ...workflow, dataset: undefined } }
    const wrapper =
      shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })
    const customButton = findCustomButtonByText(wrapper, text)

    expect(customButton).toBeUndefined()
  })

  it('renders when workflow has a dataset', () => {
    const propsData = { workflow: { ...workflow, dataset: buildV2WorkflowDatasetPayload() } }
    const wrapper =
      shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })
    const customButton = findCustomButtonByText(wrapper, text)

    expect(customButton!.exists()).toBe(true)
  })

  it('opens modal on click', () => {
    const newMocks = { ...mocks, $modal: { show: jest.fn() } }
    const propsData = { workflow: { ...workflow, dataset: buildV2WorkflowDatasetPayload() } }
    const wrapper =
      shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks: newMocks, stubs })
    const customButton = findCustomButtonByText(wrapper, text)

    customButton!.vm.$emit('click')

    expect(newMocks.$modal.show).toHaveBeenCalledWith(`instructions-${workflow.id}`)
  })
})

describe('<custom-button /> for requesting work', () => {
  const text = /\s*\+\s*request more/i

  it('does not render when assigned items greater than 0', () => {
    const propsData = { workflow: { ...workflow, assigned_items: 1 } }
    const wrapper =
        shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })
    const customButton = findCustomButtonByText(wrapper, text)

    expect(customButton).toBeUndefined()
  })

  it('renders when assigned items is undefined', () => {
    const propsData = { workflow: { ...workflow, assigned_items: undefined } }
    const wrapper =
      shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })
    const customButton = findCustomButtonByText(wrapper, text)

    expect(customButton!.exists()).toBe(true)
  })

  it('renders when assigned items is 0', () => {
    const propsData = { workflow: { ...workflow, assigned_items: 0 } }
    const wrapper =
      shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })
    const customButton = findCustomButtonByText(wrapper, text)

    expect(customButton!.exists()).toBe(true)
  })

  it('emits a `request-work` event on click', () => {
    const propsData = { workflow: { ...workflow, assigned_items: 0 } }
    const wrapper =
      shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })
    const customButton = findCustomButtonByText(wrapper, text)

    customButton!.vm.$emit('click')

    expect(wrapper!.emitted()).toHaveProperty('request-work')
  })
})

describe('<custom-button /> for starting work', () => {
  const text = /\s*\d+ assigned to you/i

  it('does not render when assigned items is undefined', () => {
    const propsData = { workflow: { ...workflow, assigned_items: undefined } }
    const wrapper =
      shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })
    const customButton = findCustomButtonByText(wrapper, text)

    expect(customButton).toBeUndefined()
  })

  it('does not render when assigned items is 0', () => {
    const propsData = { workflow: { ...workflow, assigned_items: 0 } }
    const wrapper =
      shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })
    const customButton = findCustomButtonByText(wrapper, text)

    expect(customButton).toBeUndefined()
  })

  it('renders when assigned items greater than 0', () => {
    const propsData = { workflow: { ...workflow, assigned_items: 1 } }
    const wrapper =
      shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })
    const customButton = findCustomButtonByText(wrapper, text)

    expect(customButton!.exists()).toBe(true)
  })

  it('renders the number of assigned items', () => {
    const propsData = { workflow: { ...workflow, assigned_items: 1 } }
    const wrapper =
      shallowMount(AnnotatorsWorkflowCard, { localVue, propsData, store, mocks, stubs })
    const customButton = findCustomButtonByText(wrapper, text)

    expect(customButton!.text().toLowerCase()).toBe('1 assigned to you')
  })
})
