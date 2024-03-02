import { createLocalVue, shallowMount } from '@vue/test-utils'
import Router, { Location } from 'vue-router'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildDatasetPayload } from 'test/unit/factories'

import V2DatasetDetailLayout from '@/components/Dataset/DatasetDetail/V2DatasetDetailLayout.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Router)
localVue.directive('tooltip', stubDirectiveWithAttribute)

const router: Router = new Router()

let propsData: {
  dataset: DatasetPayload,
  parentType?: string,
  parentLocation?: string | Location,
  titleEditable?: boolean
}

beforeEach(() => {
  propsData = {
    dataset: buildDatasetPayload({ id: 1, slug: 'sfh', name: 'SFH' })
  }
})

it('matches snapshot when title editable', () => {
  propsData.titleEditable = true
  const wrapper = shallowMount(V2DatasetDetailLayout, {
    localVue, propsData, router
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when title not editable', () => {
  propsData.titleEditable = false
  const wrapper = shallowMount(V2DatasetDetailLayout, {
    localVue, propsData, router
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when parentType is "dataset"', () => {
  propsData.parentType = 'dataset'
  propsData.parentLocation = '/dataset'
  const wrapper = shallowMount(V2DatasetDetailLayout, {
    localVue, propsData, router
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when parentType is "folder"', () => {
  propsData.parentType = 'dataset'
  propsData.parentLocation = '/folder'
  const wrapper = shallowMount(V2DatasetDetailLayout, {
    localVue, propsData, router
  })
  expect(wrapper).toMatchSnapshot()
})
