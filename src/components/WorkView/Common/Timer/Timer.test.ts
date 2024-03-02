import { createLocalVue, shallowMount } from '@vue/test-utils'
import { advanceTo, clear } from 'jest-date-mock'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import { Timer } from '@/components/WorkView/Common/Timer'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

const offsetFromNow = (offset: number) => Math.floor(new Date().getTime() / 1000) + offset
const now = '2030-01-01T00:00:00Z'

let propsData: {
  completesAt: number,
  dark?: boolean,
  showTimer?: boolean
}

beforeEach(() => advanceTo(now))
afterEach(() => clear())

const offsets = [10, 5, 2, 0, -5]

offsets.forEach(secondsLeft => {
  it(`matches snapshot for ${secondsLeft} seconds left`, () => {
    advanceTo(now)
    propsData = {
      completesAt: offsetFromNow(secondsLeft),
      dark: false,
      showTimer: false
    }
    const wrapper = shallowMount(Timer, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })
})

it('should match snapshot when dark is true', () => {
  propsData = {
    completesAt: offsetFromNow(10),
    dark: true,
    showTimer: false
  }
  const wrapper = shallowMount(Timer, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('should match snapshot when show cancel is false', () => {
  propsData = {
    completesAt: offsetFromNow(10),
    dark: false,
    showTimer: true
  }
  const wrapper = shallowMount(Timer, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
