import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'
import VueLazyload from 'vue-lazyload'

import Thumbnails from '@/components/Common/Thumbnails/Thumbnails.vue'

const localVue = createLocalVue()
localVue.use(VueLazyload)

type ThumbnailProp = {
  data: Array<string>,
  max?: number,
  variant: string
}

let propsData: ThumbnailProp

const filledArray = [
  '/static/test.png',
  '/static/test.png',
  '/static/test.png',
  '/static/test.png'
]

const itMatchesSnapshot = (propsData: ThumbnailProp): void => it('matches snapshot', () => {
  const wrapper = shallowMount(Thumbnails, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot({
  data: filledArray,
  max: 2,
  variant: 'small'
})

it('is instanciated', () => {
  const _propsData = {
    data: filledArray,
    max: 1,
    variant: 'small'
  }

  const wrapper = shallowMount(Thumbnails, { localVue, propsData: _propsData })
  expect(wrapper).toBeTruthy()
})

describe('when correct props are used', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = {
    data: filledArray,
    max: 1,
    variant: 'small'
  }

  beforeEach(() => {
    propsData = _propsData
    wrapper = shallowMount(Thumbnails, { localVue, propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)
})

describe('when passed array of string', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = {
    data: filledArray,
    max: 2,
    variant: 'small'
  }

  beforeEach(() => {
    propsData = _propsData
    wrapper = shallowMount(Thumbnails, { localVue, propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)

  it('renders correctly', () => {
    expect(wrapper.find('.thumbnails__row').exists()).toBe(true)
  })

  it('renders at least one thumbnail', () => {
    expect(wrapper.find('.thumbnails__row__img').exists()).toBe(true)
  })

  it('renders number of thumbnails not exceeding max', () => {
    expect(wrapper.findAll('.thumbnails__row__img').length).toBe(2)
  })
})

describe('when passed empty array of string', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = {
    data: [],
    variant: 'small'
  }

  beforeEach(() => {
    propsData = _propsData
    wrapper = shallowMount(Thumbnails, { localVue, propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)

  it('renders at least one thumbnails', () => {
    expect(wrapper.find('.thumbnails__row__img').exists()).toBe(false)
  })

  it('renders number of thumbnails not exceeding max', () => {
    expect(wrapper.findAll('.thumbnails__row__img').length).toBe(0)
  })

  it('show the \'No data inside\' message', (): void => {
    expect(wrapper.text()).toBe('No data inside')
  })
})
