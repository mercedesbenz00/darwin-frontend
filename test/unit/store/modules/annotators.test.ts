import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildTeamPayload, buildDatasetPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import { DatasetAnnotationReportPayload } from '@/store/types'
import { api, errorsByCode } from '@/utils'
import * as file from '@/utils/file'

mockApi()

const localVue = createLocalVue()
localVue.use(Vuex)

const v7 = buildTeamPayload({ name: 'V7', id: 1 })
const sfh = buildDatasetPayload({ id: 5, slug: 'sfh', name: 'SFH' })

const unauthorizedError = { response: { status: 401 } }

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
})

describe('annotators/getAnnotationReport', () => {
  const report: DatasetAnnotationReportPayload[] = []

  it('calls correct backend endpoint', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: report }))
    store.commit('team/SET_CURRENT_TEAM', v7)

    await store.dispatch('annotators/getAnnotationReport', {
      dataset: sfh, granularity: 'month', groupBy: 'dataset,user'
    })

    const expectedParams = {
      granularity: 'month',
      group_by: 'dataset,user',
      dataset_ids: sfh.id
    }

    expect(api.get).toHaveBeenCalledWith(`reports/${v7.id}/annotation`, expectedParams)
  })

  it('commits report to store', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: report }))
    store.commit('team/SET_CURRENT_TEAM', v7)

    await store.dispatch('annotators/getAnnotationReport', { dataset: sfh, granularity: 'month' })

    expect(store.state.annotators.annotationReports).toEqual([
      {
        params: {
          datasetId: sfh.id,
          granularity: 'month',
          groupBy: 'dataset',
          from: null
        },
        data: []
      }
    ])

    await store.dispatch('annotators/getAnnotationReport', {
      dataset: sfh, granularity: 'day', from: '2000-01-01T00:00:00', groupBy: 'dataset,user'
    })

    expect(store.state.annotators.annotationReports).toEqual([
      {
        params: {
          datasetId: sfh.id,
          groupBy: 'dataset',
          granularity: 'month',
          from: null
        },
        data: []
      },
      {
        params: {
          datasetId: sfh.id,
          groupBy: 'dataset,user',
          granularity: 'day',
          from: '2000-01-01T00:00:00'
        },
        data: []
      }
    ])
  })

  it('returns parsed error on error', async () => {
    jest.spyOn(api, 'get').mockRejectedValue(unauthorizedError)

    store.commit('team/SET_CURRENT_TEAM', v7)
    const { error } = await store.dispatch('annotators/getAnnotationReport', {
      dataset: sfh, granularity: 'month'
    })

    expect(error).toEqual(expect.objectContaining({
      status: 401,
      message: errorsByCode.REPORT_LOAD_NOT_AUTHORIZED
    }))
  })
})

describe('annotators/downloadAnnotationReport', () => {
  const mockDownload = {
    data: '',
    request: { getResponseHeader: jest.fn().mockReturnValue('') }
  }

  it('calls correct backend endpoint', async () => {
    jest.spyOn(api, 'download').mockResolvedValue(buildAxiosResponse(mockDownload))
    jest.spyOn(file, 'downloadFile').mockReturnValue(undefined)
    store.commit('team/SET_CURRENT_TEAM', v7)

    await store.dispatch('annotators/downloadAnnotationReport', {
      dataset: sfh,
      granularity: 'month'
    })

    const expectedParams = {
      granularity: 'month',
      group_by: 'dataset,user',
      include: 'dataset.name,user.first_name,user.last_name,user.email',
      dataset_ids: sfh.id,
      format: 'csv'
    }

    expect(api.download)
      .toHaveBeenCalledWith(`reports/${v7.id}/annotation`, { params: expectedParams })
  })

  it('returns parsed error on error', async () => {
    jest.spyOn(api, 'download').mockRejectedValue(unauthorizedError)

    store.commit('team/SET_CURRENT_TEAM', v7)
    const { error } = await store.dispatch('annotators/downloadAnnotationReport', {
      dataset: sfh, granularity: 'month'
    })

    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.REPORT_DOWNLOAD_NOT_AUTHORIZED
      })
    )
  })
})

describe('annotators/PUSH_ANNOTATION_REPORT', () => {
  it('adds report to store', () => {
    store.commit('annotators/PUSH_ANNOTATION_REPORT', {
      params: { datasetId: 1, granularity: 'day' },
      data: []
    })

    expect(store.state.annotators.annotationReports).toEqual([
      { params: { datasetId: 1, granularity: 'day' }, data: [] }
    ])

    store.commit('annotators/PUSH_ANNOTATION_REPORT', {
      params: { datasetId: 1, granularity: 'month' },
      data: []
    })

    expect(store.state.annotators.annotationReports).toEqual([
      { params: { datasetId: 1, granularity: 'day' }, data: [] },
      { params: { datasetId: 1, granularity: 'month' }, data: [] }
    ])
  })

  it('replaces existing report', () => {
    const params = { datasetId: 1, granularity: 'day' }
    store.commit('annotators/PUSH_ANNOTATION_REPORT', { params, data: [] })
    expect(store.state.annotators.annotationReports).toEqual([
      { params: { datasetId: 1, granularity: 'day' }, data: [] }
    ])

    // commit same data again
    store.commit('annotators/PUSH_ANNOTATION_REPORT', { params, data: [] })
    expect(store.state.annotators.annotationReports).toEqual([
      { params: { datasetId: 1, granularity: 'day' }, data: [] }
    ])
  })
})
