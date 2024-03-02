import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import ContentCard from '@/layouts/Main/ContentCard/ContentCard.vue'

let wrapper: Wrapper<Vue>

beforeEach(() => {
  wrapper = shallowMount(ContentCard)
})

afterEach(() => {
  wrapper.destroy()
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  expect(wrapper).toMatchSnapshot()
})

describe('ContentCard', () => {
  itMatchesSnapshot()

  it('should exist', () => {
    expect(wrapper.exists()).toBeTruthy()
  })
})

describe('when used title slot', () => {
  let wrapperSlotted: Wrapper<Vue, Element>

  itMatchesSnapshot()

  beforeAll(() => {
    wrapperSlotted = shallowMount(ContentCard, {
      slots: {
        title: { template: '<div id="title">TITLE</div>' }
      }
    })
  })

  afterAll(() => {
    wrapperSlotted.destroy()
  })

  it('should have a div with id title within its title slot', () => {
    expect(wrapperSlotted.find('#title').exists()).toBe(true)
  })
})

describe('when used default slot', () => {
  let wrapperSlotted: Wrapper<Vue, Element>

  itMatchesSnapshot()

  beforeAll(() => {
    wrapperSlotted = shallowMount(ContentCard, {
      slots: {
        default: { template: '<div id="body">BODY</div>' }
      }
    })
  })

  afterAll(() => {
    wrapperSlotted.destroy()
  })

  it('should have a div with id body within its default slot', () => {
    expect(wrapperSlotted.find('#body').exists()).toBe(true)
  })
})
