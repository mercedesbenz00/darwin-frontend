import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { VPopover } from 'test/unit/stubs'

import StageItem from '@/components/WorkView/TopBar/Stages/V1/StageItem.vue'
import { StageType } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs = { VPopover }
const slots = {
  main: 'Main UI',
  hover: 'Hover UI'
}

let propsData: {
  item: { type: StageType }
}

let store: ReturnType<typeof createTestStore>

const mocks = {
  $can: () => true
}

beforeEach(() => {
  propsData = {
    item: { type: StageType.Annotate }
  }
  store = createTestStore()
})

describe('when able to assign', () => {
  beforeEach(() => {
    mocks.$can = () => true
  })

  it('matches snapshot for annotate item', () => {
    propsData.item.type = StageType.Annotate
    const wrapper = shallowMount(StageItem, { localVue, mocks, propsData, slots, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot for review item', () => {
    propsData.item.type = StageType.Review
    const wrapper = shallowMount(StageItem, { localVue, mocks, propsData, slots, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot for complete item', () => {
    propsData.item.type = StageType.Complete
    const wrapper = shallowMount(StageItem, { localVue, mocks, propsData, slots, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when unable to assign', () => {
  beforeEach(() => {
    mocks.$can = () => false
  })

  it('matches snapshot for annotate item', () => {
    propsData.item.type = StageType.Annotate
    const wrapper = shallowMount(StageItem, { localVue, mocks, propsData, slots, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot for review item', () => {
    propsData.item.type = StageType.Review
    const wrapper = shallowMount(StageItem, { localVue, mocks, propsData, slots, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot for complete item', () => {
    propsData.item.type = StageType.Complete
    const wrapper = shallowMount(StageItem, { localVue, mocks, propsData, slots, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(StageItem, { localVue, mocks, propsData, slots, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
}

const itRendersAsAssignable = () => {
  it('renders as assignable', () => {
    const wrapper = shallowMount(StageItem, { localVue, mocks, propsData, slots, store, stubs })
    expect(wrapper.find('assignment-dropdown-stub').exists()).toBe(true)
  })
}

const itRendersAsUnassignable = () => {
  it('renders as unassignable', () => {
    const wrapper = shallowMount(StageItem, { localVue, mocks, propsData, slots, store, stubs })
    expect(wrapper.find('assignment-dropdown-stub').exists()).toBe(false)
  })
}

describe('assignability by type', () => {
  beforeEach(() => {
    mocks.$can = () => true
  })

  describe('when annotate template', () => {
    beforeEach(() => {
      propsData.item.type = StageType.Annotate
    })

    itMatchesSnapshot()
    itRendersAsAssignable()
  })

  describe('when review template', () => {
    beforeEach(() => {
      propsData.item.type = StageType.Review
    })

    itMatchesSnapshot()
    itRendersAsAssignable()
  })

  describe('when code template', () => {
    beforeEach(() => {
      propsData.item.type = StageType.Code
    })

    itMatchesSnapshot()
    itRendersAsUnassignable()
  })

  describe('when model template', () => {
    beforeEach(() => {
      propsData.item.type = StageType.Model
    })

    itMatchesSnapshot()
    itRendersAsUnassignable()
  })

  describe('when complete template', () => {
    beforeEach(() => {
      propsData.item.type = StageType.Complete
    })

    itMatchesSnapshot()
    itRendersAsUnassignable()
  })
})
