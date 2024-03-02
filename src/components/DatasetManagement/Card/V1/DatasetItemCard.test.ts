import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemPayload,
  buildDatasetVideoPayload,
  buildDatasetImagePayload,
  buildImagePayload
} from 'test/unit/factories'
import { Card } from 'test/unit/stubs'

import DatasetItemCard from '@/components/DatasetManagement/Card/V1/DatasetItemCard.vue'
import { DatasetItemStatus, DatasetItemPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let mocks: { $featureEnabled: Function, $route: any }
const stubs = { Card }

let store: ReturnType<typeof createTestStore>
let propsData: { data: DatasetItemPayload }

beforeEach(() => {
  mocks = {
    $featureEnabled: jest.fn().mockReturnValue(false),
    $route: { params: {}, query: { assignees: '1' } }
  }
  store = createTestStore()
})

const videoFramesItem = (status: DatasetItemStatus): DatasetItemPayload => buildDatasetItemPayload({
  dataset_id: 5,
  dataset_video_id: 1,
  status,
  dataset_video: buildDatasetVideoPayload({ id: 1 })
})

const videoItem = buildDatasetItemPayload({
  dataset_id: 5,
  dataset_video_id: 1,
  status: DatasetItemStatus.new,
  dataset_video: buildDatasetVideoPayload({ id: 1, annotate_as_video: true })
})

const itMatchesSnapshot = (): void => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
}

const itRendersOpenButton = (): void => {
  it('renders open button', () => {
    const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })
    expect(wrapper.find('card-button-stub').exists()).toBe(true)
    expect(wrapper.find('card-button-stub').text()).toEqual('Open')
  })
}

const itDoesNotRenderOpenButton = (): void => {
  it('does not render open button', () => {
    const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })
    expect(wrapper.find('card-button-stub').exists()).toBe(false)
  })
}

const itSetsVideoUrlOnOpenButton = (): void => {
  it('sets video location on open button', () => {
    const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })

    expect(wrapper.find('card-button-stub').props('to'))
      .toEqual({
        name: 'DatasetManagementVideo',
        params: {
          datasetId: '5',
          datasetVideoId: '1'
        },
        query: {
          assignees: '1'
        }
      })
  })
}

beforeEach(() => {
  propsData = { data: buildDatasetItemPayload() }
})

itMatchesSnapshot()

it('matches snapshot when uploading', () => {
  propsData = { data: buildDatasetItemPayload({ status: DatasetItemStatus.uploading }) }
  const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when archived', () => {
  propsData = { data: buildDatasetItemPayload({ status: DatasetItemStatus.archived }) }
  const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when error', () => {
  propsData = { data: buildDatasetItemPayload({ status: DatasetItemStatus.error }) }
  const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('when processing video item', () => {
  beforeEach(() => {
    propsData = { data: videoFramesItem(DatasetItemStatus.processing) }
  })

  itRendersOpenButton()
  itSetsVideoUrlOnOpenButton()
})

describe('when uploading video item', () => {
  beforeEach(() => {
    propsData = { data: videoFramesItem(DatasetItemStatus.uploading) }
  })

  itDoesNotRenderOpenButton()
})

describe('when new video item', () => {
  beforeEach(() => {
    propsData = { data: videoFramesItem(DatasetItemStatus.new) }
  })

  itMatchesSnapshot()
  itRendersOpenButton()
  itSetsVideoUrlOnOpenButton()
})

describe('when archived video item', () => {
  beforeEach(() => {
    propsData = { data: videoFramesItem(DatasetItemStatus.archived) }
  })

  it('renders restore button', () => {
    const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })
    expect(wrapper.find('card-button-stub').exists()).toBe(true)
    expect(wrapper.find('card-button-stub').text()).toEqual('Restore')
  })
})

describe('when annotate as video item', () => {
  beforeEach(() => {
    propsData = { data: videoItem }
  })

  it('renders restore button', () => {
    const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when external image', () => {
  beforeEach(() => {
    propsData = {
      data: buildDatasetItemPayload({
        dataset_image: buildDatasetImagePayload({
          image: buildImagePayload({ external: true })
        })
      })
    }
  })

  it('renders external tag', () => {
    const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when dicom file', () => {
  beforeEach(() => {
    propsData = {
      data: buildDatasetItemPayload({
        dataset_video: buildDatasetVideoPayload({
          id: 1,
          original_filename: 'test.dcm',
          metadata: { type: 'dicom' }
        })
      })
    }
  })

  it('renders dicom tag', () => {
    const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when pdf file', () => {
  beforeEach(() => {
    propsData = {
      data: buildDatasetItemPayload({
        dataset_video: buildDatasetVideoPayload({
          id: 1,
          original_filename: 'test.pdf',
          metadata: { type: 'pdf' }
        })
      })
    }
  })

  it('renders pdf tag', () => {
    const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when item has priority', () => {
  beforeEach(() => {
    propsData = { data: buildDatasetItemPayload({ priority: 1 }) }
  })

  it('renders priority', () => {
    const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('renders the to location properly', () => {
  describe('renders workflow route when annotate as a video', () => {
    beforeEach(() => {
      propsData = {
        data: buildDatasetItemPayload({
          dataset_id: 1,
          dataset_video: buildDatasetVideoPayload({ id: 2, annotate_as_video: true }),
          dataset_video_id: 3,
          seq: 4
        })
      }
      mocks = {
        $featureEnabled: jest.fn().mockReturnValue(true),
        $route: { params: {}, query: { assignees: '1' } }
      }
    })

    it('renders when image is in root folder', () => {
      const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })

      expect(wrapper.find('card-button-stub').props('to'))
        .toEqual({
          name: 'Workflow',
          query: { dataset: '1', image: '4', assignees: '1' }
        })
    })

    it('renders when image is under a folder', () => {
      propsData.data.path = '/test'
      const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })

      expect(wrapper.find('card-button-stub').props('to'))
        .toEqual({
          name: 'Workflow',
          query: { dataset: '1', image: '4', assignees: '1' }
        })
    })

    it('renders when image is under a folder and folder mode is enabled', () => {
      propsData.data.path = '/test'
      mocks.$route.params = { path: '/test' }
      const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })

      expect(wrapper.find('card-button-stub').props('to'))
        .toEqual({
          name: 'Workflow',
          query: { dataset: '1', image: '4', path: '/test', assignees: '1' }
        })
    })
  })

  it('renders video tab route when split video', () => {
    propsData = {
      data: buildDatasetItemPayload({
        dataset_id: 1,
        dataset_video: buildDatasetVideoPayload({ id: 2 }),
        dataset_video_id: 3
      })
    }
    const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })

    expect(wrapper.find('card-button-stub').props('to'))
      .toEqual({
        name: 'DatasetManagementVideo',
        params: { datasetId: '1', datasetVideoId: '3' },
        query: { assignees: '1' }
      })
  })

  it('renders workflow route when image', () => {
    propsData = { data: buildDatasetItemPayload({ dataset_id: 1, seq: 2 }) }
    const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })

    expect(wrapper.find('card-button-stub').props('to'))
      .toEqual({
        name: 'Workflow',
        query: { assignees: '1', dataset: '1', image: '2' }
      })
  })

  it('renders workflow route when video frame', () => {
    propsData = {
      data: buildDatasetItemPayload({
        dataset_id: 1,
        dataset_image: buildDatasetImagePayload({ dataset_video_id: 3 }),
        seq: 2
      })
    }
    const wrapper = shallowMount(DatasetItemCard, { localVue, mocks, propsData, store, stubs })

    expect(wrapper.find('card-button-stub').props('to'))
      .toEqual({
        name: 'Workflow',
        query: { assignees: '1', dataset: '1', image: '2', video_ids: '3' }
      })
  })
})
