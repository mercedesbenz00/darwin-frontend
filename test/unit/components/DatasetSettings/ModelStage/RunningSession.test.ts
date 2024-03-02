import { createLocalVue, shallowMount } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildRunningSessionPayload } from 'test/unit/factories'

import RunningSession from '@/components/DatasetSettings/ModelStage/RunningSession.vue'
import { RunningSessionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)
let propsData: {
  runningSession: RunningSessionPayload
}

const model = {
  offlineIcon: 'offline-icon-stub',
  onlineIcon: 'online-icon-stub'
}

beforeEach(() => {
  propsData = { runningSession: buildRunningSessionPayload() }
})

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(RunningSession, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })
}

const itRendersOffline = () => {
  it('renders offline', () => {
    const wrapper = shallowMount(RunningSession, { localVue, propsData })
    expect(wrapper.find(model.offlineIcon).exists()).toBe(true)
  })
}

const itRendersOnline = () => {
  it('renders online', () => {
    const wrapper = shallowMount(RunningSession, { localVue, propsData })
    expect(wrapper.find(model.onlineIcon).exists()).toBe(true)
  })
}

describe('when stopped', () => {
  beforeEach(() => {
    propsData.runningSession.min = 0
    propsData.runningSession.max = 0
    propsData.runningSession.meta.num_instances_available = 0
    propsData.runningSession.meta.num_instances_starting = 0
  })

  itMatchesSnapshot()
  itRendersOffline()
})

describe('when starting', () => {
  beforeEach(() => {
    propsData.runningSession.min = 1
    propsData.runningSession.max = 1
    propsData.runningSession.meta.num_instances_available = 0
    propsData.runningSession.meta.num_instances_starting = 1
  })

  itMatchesSnapshot()
  itRendersOffline()
})

describe('when stopping', () => {
  beforeEach(() => {
    propsData.runningSession.min = 0
    propsData.runningSession.max = 0
    propsData.runningSession.meta.num_instances_available = 1
    propsData.runningSession.meta.num_instances_starting = 0
  })

  itMatchesSnapshot()
  itRendersOffline()
})

describe('when running', () => {
  beforeEach(() => {
    propsData.runningSession.min = 1
    propsData.runningSession.max = 1
    propsData.runningSession.meta.num_instances_available = 1
    propsData.runningSession.meta.num_instances_starting = 0
  })

  itMatchesSnapshot()
  itRendersOnline()
})
