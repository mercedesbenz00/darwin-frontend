import { createLocalVue, shallowMount } from '@vue/test-utils'

import ProductExplanation from '@/components/Plans/Product/Usage/ProductExplanation.vue'

const localVue = createLocalVue()
const slots = {
  body: 'Body slot',
  title: 'Title slot'
}

it('matches snapshot', async () => {
  const wrapper = shallowMount(ProductExplanation, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
  await wrapper.setData({ open: true })
  expect(wrapper).toMatchSnapshot('open')
})

it('renders slots', () => {
  const wrapper = shallowMount(ProductExplanation, { localVue, slots })
  expect(wrapper.text()).toContain('Body slot')
  expect(wrapper.text()).toContain('Title slot')
})

const model = {
  header: '.product-explanation__header',
  body: '.product-explanation__body'
}

it('opens and closes on click', async () => {
  const wrapper = shallowMount(ProductExplanation, { localVue, slots })

  // JSDOM doesn't actually do layout so all dimensions are 0.
  // We mock the body so we can assert the component is setting correct
  // style data.
  const mockBody = {
    children: [{ clientHeight: 27 }, { clientHeight: 13 }],
    style: { maxHeight: 0 }
  } as unknown as HTMLDivElement

  wrapper.vm.$refs.body = mockBody

  await wrapper.find(model.header).trigger('click')
  expect(mockBody.style.maxHeight).toEqual('40px')
  await wrapper.find(model.header).trigger('click')
  expect(mockBody.style.maxHeight).toEqual('0')
})
