import { Route } from 'vue-router'

import {
  buildDatasetImagePayload,
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildV2DatasetFolderPayload,
  buildV2DatasetItemPayload
} from 'test/unit/factories'

import {
  resolveFolderDMLocationV2,
  resolveImageDMLocationV2,
  resolveOpenFolderDMLocationV2,
  resolveOpenImageDMLocationV2,
  resolveOpenSplitVideoDMLocationV2,
  resolveSplitVideoDMLocationV2,
  resolveVideoWorkflowLocationV2,
  resolveWorkviewLocationV2
} from '@/utils/datasetItemLocationResolverV2'

const buildRoute = (props: Partial<Route>): Route => ({
  path: '/datasets/1/dataset-management',
  hash: 'hash',
  query: {},
  params: {},
  fullPath: 'https://darwin.v7labs.com/datasets/1/dataset-management',
  matched: [],
  ...props
})

describe('resolveFolderDMLocationV2', () => {
  it('resolves route of folder in dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const folderV2 = buildV2DatasetFolderPayload({
      dataset_id: 1,
      path: '/root/test'
    })
    expect(resolveFolderDMLocationV2(route, folderV2)).toEqual({
      path: '/datasets/1/dataset-management/tree/root/test',
      query: { params: 'params' }
    })
  })
})

describe('resolveOpenFolderDMLocationV2', () => {
  it('resolves route of folder in open dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const folderV2 = buildV2DatasetFolderPayload({
      dataset_id: 1,
      path: '/root/test'
    })
    const urlPrefix = '/v7/test-dataset'
    expect(resolveOpenFolderDMLocationV2(route, folderV2, urlPrefix)).toEqual({
      path: '/v7/test-dataset/tree/root/test',
      query: { params: 'params' }
    })
  })
})

describe('resolveSplitVideoDMLocationV2', () => {
  it('resolves route of video item(split video) in dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const item = buildV2DatasetItemPayload({
      dataset_id: 1,
      id: '2'
    })
    expect(resolveSplitVideoDMLocationV2(route, item)).toEqual({
      name: 'DatasetManagementVideo',
      params: {
        datasetId: '1',
        datasetVideoId: '2'
      },
      query: { params: 'params' }
    })
  })
})

describe('resolveOpenSplitVideoDMLocationV2', () => {
  it('resolves route of video item(split video) in open dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const item = buildV2DatasetItemPayload({ id: '2' })
    const urlPrefix = '/v7/test-dataset'
    expect(resolveOpenSplitVideoDMLocationV2(route, item, urlPrefix)).toEqual({
      path: '/v7/test-dataset/videos/2',
      query: { params: 'params' }
    })
  })
})

describe('resolveVideoWorkflowLocationV2', () => {
  it('resolves route of video item under the root folder in dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const item = buildDatasetItemPayload({
      dataset_id: 1,
      path: '/',
      seq: 2
    })
    expect(resolveVideoWorkflowLocationV2(route, item)).toEqual({
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
    expect(resolveVideoWorkflowLocationV2(route, item)).toEqual({
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

describe('resolveImageDMLocationV2', () => {
  it('resolves route of image item under the root folder in dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const item = buildDatasetItemPayload({
      dataset_id: 1,
      dataset_image: buildDatasetImagePayload({ dataset_video_id: null }),
      path: '/',
      seq: 2
    })
    expect(resolveImageDMLocationV2(route, item)).toEqual({
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
    expect(resolveImageDMLocationV2(route, item)).toEqual({
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
    expect(resolveImageDMLocationV2(route, item)).toEqual({
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

describe('resolveOpenImageDMLocationV2', () => {
  it('resolves route of open image item under the root folder in dataset management', () => {
    const route = buildRoute({ query: { params: 'params' } })
    const item = buildDatasetItemPayload({
      dataset_id: 1,
      dataset_image: buildDatasetImagePayload({ dataset_video_id: null }),
      path: '/',
      seq: 2
    })
    const urlPrefix = '/v7/test-dataset'
    expect(resolveOpenImageDMLocationV2(route, item, urlPrefix)).toEqual({
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
    expect(resolveOpenImageDMLocationV2(route, item, urlPrefix)).toEqual({
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
    expect(resolveOpenImageDMLocationV2(route, item, urlPrefix)).toEqual({
      path: '/v7/test-dataset/2',
      query: {
        params: 'params',
        video_ids: '3'
      }
    })
  })
})

describe('resolveWorkviewLocationV2', () => {
  it('resolves dataset management route in workview', () => {
    const route = buildRoute({
      path: '/workview',
      query: { params: 'params' }
    })
    const dataset = buildDatasetPayload({ id: 1 })
    expect(resolveWorkviewLocationV2(route, dataset)).toEqual({
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
    expect(resolveWorkviewLocationV2(route, dataset)).toEqual({
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
    expect(resolveWorkviewLocationV2(route, dataset)).toEqual({
      path: '/datasets/1/dataset-management/3',
      query: { params: 'params' }
    })
  })
})
