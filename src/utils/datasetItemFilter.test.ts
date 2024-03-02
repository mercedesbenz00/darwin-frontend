import { Route } from 'vue-router'

import { buildDatasetItemFilter } from 'test/unit/factories'

import { SortOptions } from '@/components/DatasetFiltering/types'
import { DatasetItemStatus, DatasetItemType } from '@/store/types'
import {
  getDatasetItemFilterFromRouteQuery,
  getRouteQueryFromDatasetItemFilter,
  isEqualDatasetItemFilter
} from '@/utils/datasetItemFilter'

const baseFilter = buildDatasetItemFilter({
  annotation_class_ids: [1, 2],
  not_annotation_class_ids: [11, 12],
  assignees: [2, 3],
  not_assignees: [12, 13],
  current_assignees: [3, 4],
  not_current_assignees: [13, 14],
  filenames: ['1.jpg', '2.jpg'],
  not_filenames: ['11.jpg', '12.jpg'],
  has_comments: true,
  path: '/root',
  not_path: '/home',
  paths: ['/root', '/root/test'],
  not_paths: ['/home', '/home/test'],
  sort: { inserted_at: 'desc' },
  statuses: [DatasetItemStatus.annotate],
  not_statuses: [DatasetItemStatus.review],
  types: [DatasetItemType.image],
  not_types: [DatasetItemType.videoFrame],
  video_ids: [1, 2],
  not_video_ids: [11, 12],
  workflow_stage_template_ids: [2, 3],
  not_workflow_stage_template_ids: [12, 13],
  current_workflow_stage_ids: ['foo', 'bar'],
  not_current_workflow_stage_ids: ['baz']
})

describe('isEqualDatasetItemFilter', () => {
  it('returns true when everything is same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter })
    const filterB = buildDatasetItemFilter({ ...baseFilter })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeTruthy()
  })

  it('returns true when "dataset_item_ids" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, dataset_item_ids: [1, 2] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, dataset_item_ids: [2, 3] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeTruthy()
  })

  it('returns true when "filename_contains" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, filename_contains: '1.jpg' })
    const filterB = buildDatasetItemFilter({ ...baseFilter, filename_contains: '2.jpg' })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeTruthy()
  })

  it('returns false when "annotation_class_ids" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, annotation_class_ids: [1, 2] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, annotation_class_ids: [2, 3] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "assignees" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, assignees: [1, 2] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, assignees: [2, 3] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "current_assignees" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, current_assignees: [1, 2] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, current_assignees: [2, 3] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "filenames" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, filenames: ['1.jpg'] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, filenames: ['2.jpg'] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "has_comments" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, has_comments: true })
    const filterB = buildDatasetItemFilter({ ...baseFilter, has_comments: false })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns true when "page" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, page: { size: 100 } })
    const filterB = buildDatasetItemFilter({ ...baseFilter, page: { size: 200 } })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeTruthy()
  })

  it('returns false when "path" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, path: '/' })
    const filterB = buildDatasetItemFilter({ ...baseFilter, path: '/root' })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "paths" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, paths: ['/'] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, paths: ['/root'] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "sort" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, sort: { inserted_at: 'asc' } })
    const filterB = buildDatasetItemFilter({ ...baseFilter, sort: { inserted_at: 'desc' } })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "statuses" is not same', () => {
    const filterA = buildDatasetItemFilter({
      ...baseFilter,
      statuses: [DatasetItemStatus.annotate]
    })
    const filterB = buildDatasetItemFilter({
      ...baseFilter,
      statuses: [DatasetItemStatus.complete]
    })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "types" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, types: [DatasetItemType.image] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, types: [DatasetItemType.splitVideo] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "video_ids" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, video_ids: [1] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, video_ids: [2] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "workflow_stage_template_ids" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, workflow_stage_template_ids: [3] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, workflow_stage_template_ids: [4] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "not_annotation_class_ids" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, not_annotation_class_ids: [11, 12] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, not_annotation_class_ids: [12, 13] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "not_assignees" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, not_assignees: [11, 12] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, not_assignees: [12, 13] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "not_current_assignees" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, not_current_assignees: [11, 12] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, not_current_assignees: [12, 13] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "not_filenames" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, not_filenames: ['11.jpg'] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, not_filenames: ['12.jpg'] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "not_path" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, not_path: '/' })
    const filterB = buildDatasetItemFilter({ ...baseFilter, not_path: '/root' })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "not_paths" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, not_paths: ['/'] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, not_paths: ['/root'] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "not_statuses" is not same', () => {
    const filterA = buildDatasetItemFilter({
      ...baseFilter,
      not_statuses: [DatasetItemStatus.annotate]
    })
    const filterB = buildDatasetItemFilter({
      ...baseFilter,
      not_statuses: [DatasetItemStatus.complete]
    })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "not_types" is not same', () => {
    const filterA = buildDatasetItemFilter({
      ...baseFilter,
      not_types: [DatasetItemType.image]
    })
    const filterB = buildDatasetItemFilter({
      ...baseFilter,
      not_types: [DatasetItemType.splitVideo]
    })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "not_video_ids" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, not_video_ids: [1] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, not_video_ids: [2] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "not_workflow_stage_template_ids" is not same', () => {
    const filterA = buildDatasetItemFilter({ ...baseFilter, not_workflow_stage_template_ids: [3] })
    const filterB = buildDatasetItemFilter({ ...baseFilter, not_workflow_stage_template_ids: [4] })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "not_current_workflow_stage_ids" is not same', () => {
    const filterA = buildDatasetItemFilter({
      ...baseFilter, not_current_workflow_stage_ids: ['foo']
    })
    const filterB = buildDatasetItemFilter({
      ...baseFilter, not_current_workflow_stage_ids: ['bar']
    })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })

  it('returns false when "current_workflow_stage_ids" is not same', () => {
    const filterA = buildDatasetItemFilter({
      ...baseFilter, current_workflow_stage_ids: ['foo']
    })
    const filterB = buildDatasetItemFilter({
      ...baseFilter, current_workflow_stage_ids: ['bar']
    })

    expect(isEqualDatasetItemFilter(filterA, filterB)).toBeFalsy()
  })
})

describe('getRouteQueryFromDatasetItemFilter', () => {
  it('returns route query from dataset item filter', () => {
    const filter = buildDatasetItemFilter()
    expect(getRouteQueryFromDatasetItemFilter({}, filter)).toEqual({})
  })

  it('returns router query from dataset item filter over original query', () => {
    const originalQuery: Route['query'] = {
      annotation_class_ids: ['3'],
      not_annotation_class_ids: ['13'],
      current_assignees: ['11'],
      not_current_assignees: ['22'],
      filenames: ['13.jpg'],
      not_filenames: ['13.jpg'],
      has_comments: 'false',
      path: '/',
      not_path: '/',
      paths: [],
      not_paths: [],
      sort: 'priority:desc',
      statuses: [],
      not_statuses: [],
      workflow_stage_template_ids: ['1'],
      not_workflow_stage_template_ids: ['11'],
      current_workflow_stage_ids: ['foo', 'bar'],
      not_current_workflow_stage_ids: ['baz']
    }
    expect(getRouteQueryFromDatasetItemFilter(originalQuery, baseFilter)).toEqual({
      annotation_class_ids: ['1', '2'],
      not_annotation_class_ids: ['11', '12'],
      current_assignees: ['3', '4'],
      not_current_assignees: ['13', '14'],
      filenames: ['1.jpg', '2.jpg'],
      not_filenames: ['11.jpg', '12.jpg'],
      has_comments: 'true',
      path: '/root',
      not_path: '/home',
      paths: ['/root', '/root/test'],
      not_paths: ['/home', '/home/test'],
      sort: 'inserted_at:desc',
      statuses: ['annotate'],
      not_statuses: ['review'],
      workflow_stage_template_ids: ['2', '3'],
      not_workflow_stage_template_ids: ['12', '13'],
      current_workflow_stage_ids: ['foo', 'bar'],
      not_current_workflow_stage_ids: ['baz']
    })
  })
})

describe('getDatasetItemFilterFromRouteQuery', () => {
  const defaultSortOptions: SortOptions = {
    sortBy: 'inserted_at',
    sortDirection: 'desc',
    sort: { inserted_at: 'desc' },
    sortString: 'inserted_at:desc'
  }

  it('returns dataset item filter from route query', () => {
    expect(getDatasetItemFilterFromRouteQuery({}, defaultSortOptions)).toEqual({
      sort: { inserted_at: 'desc' }
    })
  })

  it('returns dataset item filter from route query', () => {
    expect(getDatasetItemFilterFromRouteQuery({
      annotation_class_ids: ['1', '2'],
      not_annotation_class_ids: ['11', '12'],
      current_assignees: ['2', '3'],
      not_current_assignees: ['12', '13'],
      filenames: ['1.jpg', '2.jpg'],
      not_filenames: ['11.jpg', '12.jpg'],
      has_comments: 'true',
      path: '/root',
      not_path: '/home',
      paths: ['/root', '/root/test'],
      not_paths: ['/home', '/home/test'],
      sort: 'inserted_at:desc',
      statuses: ['annotate'],
      not_statuses: ['review'],
      workflow_stage_template_ids: ['2', '3'],
      not_workflow_stage_template_ids: ['12', '13'],
      current_workflow_stage_ids: ['foo', 'bar'],
      not_current_workflow_stage_ids: ['baz']
    }, defaultSortOptions)).toEqual({
      annotation_class_ids: [1, 2],
      not_annotation_class_ids: [11, 12],
      current_assignees: [2, 3],
      not_current_assignees: [12, 13],
      filenames: ['1.jpg', '2.jpg'],
      not_filenames: ['11.jpg', '12.jpg'],
      has_comments: true,
      path: '/root',
      not_path: '/home',
      paths: ['/root', '/root/test'],
      not_paths: ['/home', '/home/test'],
      sort: { inserted_at: 'desc' },
      statuses: [DatasetItemStatus.annotate],
      not_statuses: [DatasetItemStatus.review],
      workflow_stage_template_ids: [2, 3],
      not_workflow_stage_template_ids: [12, 13],
      current_workflow_stage_ids: ['foo', 'bar'],
      not_current_workflow_stage_ids: ['baz']
    })
  })
})
