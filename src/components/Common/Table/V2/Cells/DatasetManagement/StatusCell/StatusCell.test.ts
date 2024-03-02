import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'
import VueLazyload from 'vue-lazyload'

import { createMockTheme } from 'test/unit/components/mocks'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import {
  StatusCellProps
} from '@/components/Common/Table/V2/Cells/DatasetManagement/StatusCell/types'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'

import StatusCell from './StatusCell.vue'

let wrapper: Wrapper<Vue>

const localVue = createLocalVue()
localVue.use(VueLazyload)
localVue.directive('tooltip', () => stubDirectiveWithAttribute)

const mocks = { $theme: createMockTheme() }

const propsData: StatusCellProps = {
  status: DatasetItemStatus.annotate,
  name: 'Louis Raetz',
  url: null
}

const slots = {
  default: 'Test label'
}

describe('no url', () => {
  beforeEach(() => {
    wrapper = shallowMount(StatusCell, {
      localVue,
      propsData,
      mocks,
      slots
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should render properly', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should display the correct label', () => {
    expect(wrapper.find('.status-cell__label').text()).toEqual('Test label')
  })
})
