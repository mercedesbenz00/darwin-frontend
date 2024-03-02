import { createLocalVue, shallowMount } from '@vue/test-utils'

import DataPoint from '@/components/Dashboard/DataPoint.vue'

const localVue = createLocalVue()

const dataPoints = [
  { label: 'Numeric 10', value: 10 },
  { label: 'Numeric 100', value: 100 },
  { label: 'Numeric 1000', value: 1000 },
  { label: 'Numeric 10000', value: 10000 },
  { label: 'Numeric 100000', value: 100000 },
  { label: 'Percentage', value: 85.2, type: 'percentage' },
  { label: 'Duration', value: 3601, type: 'duration' },
  { label: 'Numeric 10 with color', value: 10, color: '#FFFFFF' }
]

dataPoints.forEach(dataPoint => {
  it(`matches snapshot for ${dataPoint.label}, ${dataPoint.type || 'numeric'} `, () => {
    const propsData = dataPoint
    const wrapper = shallowMount(DataPoint, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })
})
