import { createLocalVue, shallowMount } from '@vue/test-utils'

import Wizard from '@/components/Common/Wizard.vue'

const localVue = createLocalVue()

let propsData: {
  steps: string[],
  step: number
}

beforeEach(() => {
  propsData = { step: 0, steps: ['foo', 'bar', 'baz'] }
})

it('matches snapshot', async () => {
  const wrapper = shallowMount(Wizard, { localVue, propsData })
  expect(wrapper).toMatchSnapshot('initial (step foo)')

  await wrapper.setProps({ step: 1 })
  expect(wrapper).toMatchSnapshot('step bar')

  await wrapper.setProps({ step: 2 })
  expect(wrapper).toMatchSnapshot('step baz')
})

it('correctly assigns current class', async () => {
  const wrapper = shallowMount(Wizard, { localVue, propsData })

  expect(wrapper.findAll('.wizard__step').at(0).classes()).toContain('wizard__step--current')
  expect(wrapper.findAll('.wizard__step').at(1).classes()).not.toContain('wizard__step--current')
  expect(wrapper.findAll('.wizard__step').at(2).classes()).not.toContain('wizard__step--current')

  await wrapper.setProps({ step: 1 })
  expect(wrapper.findAll('.wizard__step').at(0).classes()).not.toContain('wizard__step--current')
  expect(wrapper.findAll('.wizard__step').at(1).classes()).toContain('wizard__step--current')
  expect(wrapper.findAll('.wizard__step').at(2).classes()).not.toContain('wizard__step--current')

  await wrapper.setProps({ step: 2 })
  expect(wrapper.findAll('.wizard__step').at(0).classes()).not.toContain('wizard__step--current')
  expect(wrapper.findAll('.wizard__step').at(1).classes()).not.toContain('wizard__step--current')
  expect(wrapper.findAll('.wizard__step').at(2).classes()).toContain('wizard__step--current')

  await wrapper.setProps({ step: 1 })
  expect(wrapper.findAll('.wizard__step').at(0).classes()).not.toContain('wizard__step--current')
  expect(wrapper.findAll('.wizard__step').at(1).classes()).toContain('wizard__step--current')
  expect(wrapper.findAll('.wizard__step').at(2).classes()).not.toContain('wizard__step--current')
})

it('correctly assigns unvisited class', async () => {
  const wrapper = shallowMount(Wizard, { localVue, propsData })

  expect(wrapper.findAll('.wizard__step').at(0).classes()).not.toContain('wizard__step--unvisited')
  expect(wrapper.findAll('.wizard__step').at(1).classes()).toContain('wizard__step--unvisited')
  expect(wrapper.findAll('.wizard__step').at(2).classes()).toContain('wizard__step--unvisited')

  await wrapper.setProps({ step: 1 })
  expect(wrapper.findAll('.wizard__step').at(0).classes()).not.toContain('wizard__step--unvisited')
  expect(wrapper.findAll('.wizard__step').at(1).classes()).not.toContain('wizard__step--unvisited')
  expect(wrapper.findAll('.wizard__step').at(2).classes()).toContain('wizard__step--unvisited')

  await wrapper.setProps({ step: 2 })
  expect(wrapper.findAll('.wizard__step').at(0).classes()).not.toContain('wizard__step--unvisited')
  expect(wrapper.findAll('.wizard__step').at(1).classes()).not.toContain('wizard__step--unvisited')
  expect(wrapper.findAll('.wizard__step').at(2).classes()).not.toContain('wizard__step--unvisited')

  await wrapper.setProps({ step: 1 })
  expect(wrapper.findAll('.wizard__step').at(0).classes()).not.toContain('wizard__step--unvisited')
  expect(wrapper.findAll('.wizard__step').at(1).classes()).not.toContain('wizard__step--unvisited')
  expect(wrapper.findAll('.wizard__step').at(2).classes()).not.toContain('wizard__step--unvisited')
})

it('emits "step"', async () => {
  const wrapper = shallowMount(Wizard, { localVue, propsData })
  const fooRef = { offsetTop: 10 } as unknown as HTMLDivElement
  const barRef = { offsetTop: 20 } as unknown as HTMLDivElement
  const bazRef = { offsetTop: 30 } as unknown as HTMLDivElement
  wrapper.vm.$refs.step_0 = [fooRef]
  wrapper.vm.$refs.step_1 = [barRef]
  wrapper.vm.$refs.step_2 = [bazRef]

  await wrapper.setProps({ step: 1 })
  expect(wrapper.emitted().step![0]).toEqual([1, 20])

  await wrapper.setProps({ step: 2 })
  expect(wrapper.emitted().step![1]).toEqual([2, 30])

  await wrapper.setProps({ step: 0 })
  expect(wrapper.emitted().step![2]).toEqual([0, 10])
})

it('emits "update:step"', async () => {
  // attachTo is needed when verifying focus events
  const wrapper = shallowMount(Wizard, { attachTo: document.body, localVue, propsData })

  await wrapper.findAll('.wizard__step').at(0).trigger('focus')
  expect(wrapper.emitted()['update:step']![0]).toEqual([0])

  await wrapper.findAll('.wizard__step').at(1).trigger('focus')
  expect(wrapper.emitted()['update:step']![1]).toEqual([1])

  await wrapper.findAll('.wizard__step').at(2).trigger('focus')
  expect(wrapper.emitted()['update:step']![2]).toEqual([2])
})

describe('given scoped slots', () => {
  const scopedSlots = {
    step: `
    <div class="scoped-step" slot-scope="ctx">
      <button @click="ctx.onContinue" />
    </div>
    `
  }
  it('matches snapshot', () => {
    const wrapper = shallowMount(Wizard, { localVue, propsData, scopedSlots })
    expect(wrapper).toMatchSnapshot()
  })

  it('passes "onContinue" handler', async () => {
    const wrapper = shallowMount(Wizard, { localVue, propsData, scopedSlots })
    await wrapper.setProps({ step: 1 })
    expect(wrapper.emitted().step![0]).toEqual([1, 0])
  })

  it('does not pass "onContinue" if triggered from non-current step', async () => {
    const wrapper = shallowMount(Wizard, { localVue, propsData, scopedSlots })
    await wrapper.findAll('.scoped-step button').at(1).trigger('click')
    expect(wrapper.emitted().step).toBeUndefined()
  })
})
