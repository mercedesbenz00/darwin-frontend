import { Route } from 'vue-router'

import {
  buildDatasetFolderPayload,
  buildDatasetImagePayload,
  buildDatasetItemPayload,
  buildDatasetPayload
} from 'test/unit/factories'

import {
  resolveFolderDMLocation,
  resolveImageDMLocation,
  resolveOpenFolderDMLocation,
  resolveOpenImageDMLocation,
  resolveOpenSplitVideoDMLocation,
  resolveSplitVideoDMLocation,
  resolveVideoWorkflowLocation,
  resolveWorkviewLocation
} from '@/utils/datasetItemLocationResolver'

const buildRoute = (props: Partial<Route>): Route => ({
  path: '/datasets/1/dataset-management',
  hash: 'hash',
  query: {},
  params: {},
  fullPath: 'https://darwin.v7labs.com/datasets/1/dataset-management',
  matched: [],
  ...props
})

describe('resolveFolderDMLocation', () => {
  it('resolves route of folder in dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const folder = buildDatasetFolderPayload({
      dataset_id: 1,
      path: '/root/test'
    })
    expect(resolveFolderDMLocation(route, folder)).toEqual({
      path: '/datasets/1/dataset-management/tree/root/test',
      query: { params: 'params' }
    })
  })
})

describe('resolveOpenFolderDMLocation', () => {
  it('resolves route of folder in open dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const folder = buildDatasetFolderPayload({
      dataset_id: 1,
      path: '/root/test'
    })
    const urlPrefix = '/v7/test-dataset'
    expect(resolveOpenFolderDMLocation(route, folder, urlPrefix)).toEqual({
      path: '/v7/test-dataset/tree/root/test',
      query: { params: 'params' }
    })
  })
})

describe('resolveSplitVideoDMLocation', () => {
  it('resolves route of video item(split video) in dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const item = buildDatasetItemPayload({
      dataset_id: 1,
      dataset_video_id: 2
    })
    expect(resolveSplitVideoDMLocation(route, item)).toEqual({
      name: 'DatasetManagementVideo',
      params: {
        datasetId: '1',
        datasetVideoId: '2'
      },
      query: { params: 'params' }
    })
  })
})

describe('resolveOpenSplitVideoDMLocation', () => {
  it('resolves route of video item(split video) in open dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const item = buildDatasetItemPayload({ dataset_video_id: 2 })
    const urlPrefix = '/v7/test-dataset'
    expect(resolveOpenSplitVideoDMLocation(route, item, urlPrefix)).toEqual({
      path: '/v7/test-dataset/videos/2',
      query: { params: 'params' }
    })
  })
})

describe('resolveVideoWorkflowLocation', () => {
  it('resolves route of video item under the root folder in dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const item = buildDatasetItemPayload({
      dataset_id: 1,
      path: '/',
      seq: 2
    })
    expect(resolveVideoWorkflowLocation(route, item)).toEqual({
      name: 'Workflow',
      query: {
        dataset: '1',
        image: '2',
        params: 'params'
      }
    })
  })

  it('resolves route of video item under the folder in dataset management', () => {
    const route = buildRoute({
      params: { path: '/root/test' },
      query: { params: 'params' }
    })
    const item = buildDatasetItemPayload({
      dataset_id: 1,
      path: '/root/test',
      seq: 2
    })
    expect(resolveVideoWorkflowLocation(route, item)).toEqual({
      name: 'Workflow',
      query: {
        dataset: '1',
        image: '2',
        params: 'params',
        path: '/root/test'
      }
    })
  })
})

describe('resolveImageDMLocation', () => {
  it('resolves route of image item under the root folder in dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const item = buildDatasetItemPayload({
      dataset_id: 1,
      dataset_image: buildDatasetImagePayload({ dataset_video_id: null }),
      path: '/',
      seq: 2
    })
    expect(resolveImageDMLocation(route, item)).toEqual({
      name: 'Workflow',
      query: {
        dataset: '1',
        image: '2',
        params: 'params'
      }
    })
  })

  it('resolves route of image item under the folder in dataset management', () => {
    const route = buildRoute({
      params: { path: '/root/test' },
      query: { params: 'params' }
    })
    const item = buildDatasetItemPayload({
      dataset_id: 1,
      dataset_image: buildDatasetImagePayload({ dataset_video_id: null }),
      path: '/root/test',
      seq: 2
    })
    expect(resolveImageDMLocation(route, item)).toEqual({
      name: 'Workflow',
      query: {
        dataset: '1',
        image: '2',
        params: 'params',
        path: '/root/test'
      }
    })
  })

  it('resolves route of image from split_video in dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const item = buildDatasetItemPayload({
      dataset_id: 1,
      dataset_image: buildDatasetImagePayload({ dataset_video_id: 3 }),
      seq: 2
    })
    expect(resolveImageDMLocation(route, item)).toEqual({
      name: 'Workflow',
      query: {
        dataset: '1',
        image: '2',
        params: 'params',
        video_ids: '3'
      }
    })
  })
})

describe('resolveOpenImageDMLocation', () => {
  it('resolves route of open image item under the root folder in dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const item = buildDatasetItemPayload({
      dataset_id: 1,
      dataset_image: buildDatasetImagePayload({ dataset_video_id: null }),
      path: '/',
      seq: 2
    })
    const urlPrefix = '/v7/test-dataset'
    expect(resolveOpenImageDMLocation(route, item, urlPrefix)).toEqual({
      path: '/v7/test-dataset/2',
      query: {
        params: 'params'
      }
    })
  })

  it('resolves route of image item under the folder in dataset management', () => {
    const route = buildRoute({
      params: { path: '/root/test' },
      query: { params: 'params' }
    })
    const item = buildDatasetItemPayload({
      dataset_id: 1,
      dataset_image: buildDatasetImagePayload({ dataset_video_id: null }),
      path: '/root/test',
      seq: 2
    })
    const urlPrefix = '/v7/test-dataset'
    expect(resolveOpenImageDMLocation(route, item, urlPrefix)).toEqual({
      path: '/v7/test-dataset/2',
      query: {
        params: 'params',
        path: '/root/test'
      }
    })
  })

  it('resolves route of image from split_video in dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const item = buildDatasetItemPayload({
      dataset_id: 1,
      dataset_image: buildDatasetImagePayload({ dataset_video_id: 3 }),
      seq: 2
    })
    const urlPrefix = '/v7/test-dataset'
    expect(resolveOpenImageDMLocation(route, item, urlPrefix)).toEqual({
      path: '/v7/test-dataset/2',
      query: {
        params: 'params',
        video_ids: '3'
      }
    })
  })
})

describe('resolveWorkviewLocation', () => {
  it('resolves dataset management route in workview', () => {
    const route = buildRoute({
      path: '/workview',
      query: { params: 'params' }
    })
    const dataset = buildDatasetPayload({ id: 1 })
    expect(resolveWorkviewLocation(route, dataset)).toEqual({
      path: '/datasets/1/dataset-management',
      query: { params: 'params' }
    })
  })

  it('resolves dataset management route from item under the folder in workview', () => {
    const route = buildRoute({
      path: '/workview',
      query: {
        params: 'params',
        path: '/root/test'
      }
    })
    const dataset = buildDatasetPayload({ id: 1 })
    expect(resolveWorkviewLocation(route, dataset)).toEqual({
      path: '/datasets/1/dataset-management/tree/root/test',
      query: { params: 'params' }
    })
  })

  it('resolves dataset management route from item under split_video in workview', () => {
    const route = buildRoute({
      path: '/workview',
      query: {
        params: 'params',
        video_ids: '3'
      }
    })
    const dataset = buildDatasetPayload({ id: 1 })
    expect(resolveWorkviewLocation(route, dataset)).toEqual({
      path: '/datasets/1/dataset-management/3',
      query: { params: 'params' }
    })
  })
})
