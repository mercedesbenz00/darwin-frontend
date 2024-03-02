import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'
import Router from 'vue-router'
import Vuex from 'vuex'

import { buildDatasetFolderPayload } from 'test/unit/factories'

import TableFolder from './TableFolder.vue'
import { TableFolderProps } from './types'

let wrapper: Wrapper<Vue>

const localVue = createLocalVue()
localVue.use(Router)
localVue.use(Vuex)

const propsData: TableFolderProps = {
  tableId: '123',
  data: buildDatasetFolderPayload({ path: '/Flowers' }),
  readonly: false,
  urlPrefix: null
}

const slots = {
  default: '<div id="test-slot" />'
}

const stubs = ['router-link']
const router: Router = new Router()

beforeEach(() => {
  wrapper = shallowMount(TableFolder, { localVue, router, propsData, slots, stubs })
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

it('should properly render labels', () => {
  expect(wrapper.findAll('.table-folder__label').at(0).text()).toEqual('Flowers')
  expect(wrapper.findAll('.table-folder__label').at(1).text()).toEqual('0')
})

it('should match id', () => {
  expect(wrapper.find('.table-folder').attributes().id).toEqual('table-folder_123')
})
