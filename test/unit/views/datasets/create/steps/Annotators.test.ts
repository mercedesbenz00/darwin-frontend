import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'

import { installCommonComponents } from '@/plugins/components'
import updateDataset from '@/store/modules/dataset/actions/updateDataset'
import { StoreActionPayload } from '@/store/types'
import { constructError } from '@/utils'
import Annotators from '@/views/datasets/create/steps/Annotators.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

const stubs: Stubs = {
  'template-editor': {
    template: `
      <div class="template">
        <slot name="header-other" />
      </div>
    `
  },
  'workflow-work-size': true
}

const mocks = {
  $ga: { event: jest.fn() },
  $route: { params: { datasetId: 1 } },
  $router: { push: jest.fn() }
}

const sfh = buildDatasetPayload({ id: 1, name: 'sfh' })

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('matches snapshot', () => {
  const propsData = { dataset: sfh }
  const wrapper = shallowMount(Annotators, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

const model = {
  saveButton: 'positive-button-stub',
  templateEditor: '.template'
}

describe('continue after updating the dataset when you click on Save & Continue', () => {
  let wrapper: any

  beforeEach(() => {
    const propsData = { dataset: sfh }
    wrapper = shallowMount(Annotators, { localVue, mocks, propsData, store, stubs })

    const templateEditor = wrapper.vm.$refs.templateEditor as any
    templateEditor.saveWorkflowTemplate = jest.fn().mockResolvedValue({})
  })

  it('dispatch updateDataset when click on continue and if success, move to next screen', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({})

    await wrapper.find(model.saveButton).vm.$emit('click')
    await flushPromises()

    const payload: StoreActionPayload<typeof updateDataset> = {
      dataset: sfh,
      params: { workSize: 10, workPrioritization: 'inserted_at:asc' }
    }
    expect(store.dispatch).toHaveBeenCalledWith('dataset/updateDataset', payload)

    await flushPromises()
    expect(mocks.$ga.event).toHaveBeenCalledWith('create_dataset', 'continue_step_4', 'success')

    const templateEditor = wrapper.vm.$refs.templateEditor as any
    expect(templateEditor.saveWorkflowTemplate).toBeCalled()
    expect(mocks.$router.push).toHaveBeenCalledWith({
      name: 'DatasetManagementData',
      params: { datasetId: 1 }
    })
  })

  it('update annotators when click on continue and if fails, emit ga events', async () => {
    const templateEditor = wrapper.vm.$refs.templateEditor as any
    templateEditor.saveWorkflowTemplate = jest.fn().mockResolvedValue({ error: { response: { status: 400 } } })

    await wrapper.find(model.saveButton).vm.$emit('click')
    await flushPromises()

    expect(mocks.$ga.event).toBeCalledWith(
      'create_dataset',
      'continue_step_4',
      'failure_request_failed',
      undefined
    )
  })

  it('dispatch updateDataset when click on continue and if fails, emit ga events', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { response: { status: 400 } } })

    await wrapper.find(model.saveButton).vm.$emit('click')
    await flushPromises()

    expect(mocks.$ga.event).toBeCalledWith(
      'create_dataset',
      'continue_step_4',
      'failure_request_failed',
      400
    )
  })

  it('dispatches toast on error when saving workflow template', async () => {
    const templateEditor = wrapper.vm.$refs.templateEditor as any
    const response = constructError('WORKFLOW_TEMPLATE_NAME_EMPTY')
    templateEditor.saveWorkflowTemplate = jest.fn().mockResolvedValue(response)

    await wrapper.find(model.templateEditor).vm.$emit('change')
    await wrapper.find(model.saveButton).vm.$emit('click')
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: response.error.message })
  })
})
