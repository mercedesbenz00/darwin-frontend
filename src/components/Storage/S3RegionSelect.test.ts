import { createLocalVue, shallowMount } from '@vue/test-utils'

import S3RegionSelect from '@/components/Storage/S3RegionSelect.vue'

const localVue = createLocalVue()
let propsData: {
  value: string
}

const AWS_REGIONS = [
  'us-east-2',
  'us-east-1',
  'us-west-1',
  'us-west-2',
  'af-south-1',
  'ap-east-1',
  'ap-south-1',
  'ap-northeast-3',
  'ap-northeast-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ca-central-1',
  'cn-north-1',
  'cn-northwest-1',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-south-1',
  'eu-west-3',
  'eu-north-1',
  'me-south-1',
  'sa-east-1'
]

beforeEach(() => {
  propsData = {
    value: 'us-east-2'
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(S3RegionSelect, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('should use AWS\'s regions as options', () => {
  const wrapper = shallowMount(S3RegionSelect, { localVue, propsData })

  expect(wrapper.vm.options).toStrictEqual(AWS_REGIONS)
})
