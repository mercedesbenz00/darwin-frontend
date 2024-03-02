import isEqual from 'lodash/isEqual'
import omit from 'lodash/omit'
import { Route } from 'vue-router/types/router'

import { SortOptions } from '@/components/DatasetFiltering/types'
import {
  V2DatasetItemFilter,
  DatasetItemStatus,
  DatasetPayload,
  isDatasetItemStatus
} from '@/store/types'

import {
  parseRouteQueryToNumberArray,
  parseRouteQueryToString,
  parseRouteQueryToStringArray
} from './array'

export const isEqualV2DatasetItemFilter = (
  filterA: V2DatasetItemFilter,
  filterB: V2DatasetItemFilter
): boolean => {
  const filterKeys: (keyof V2DatasetItemFilter)[] = [
    'annotation_class_ids',
    'not_annotation_class_ids',
    'assignees',
    'not_assignees',
    'has_comments',
    'item_names',
    'not_item_names',
    'item_path_prefix',
    'not_item_path_prefix',
    'item_paths',
    'not_item_paths',
    'item_name_contains',
    'sort',
    'statuses',
    'not_statuses',
    'types',
    'not_types',
    'video_ids',
    'not_video_ids',
    'workflow_stage_ids',
    'not_workflow_stage_ids'
  ]

  return filterKeys.every((key) => isEqual(filterA[key], filterB[key]))
}

const isValidSortDirection =
  (value: string): value is ('asc' | 'desc') => ['asc', 'desc'].includes(value)

export const getSortOptionsFromStringV2 = (sortString: string): SortOptions | null => {
  const [sortBy, sortDirection] = sortString.split(':')
  if (!isValidSortDirection(sortDirection)) { return null }
  return {
    sort: { [sortBy]: sortDirection },
    sortString,
    sortBy,
    sortDirection
  }
}

export const getV2DatasetDefaultSortOptions = (dataset: DatasetPayload): SortOptions | null => {
  const [sortBy, sortDirection] = (dataset.work_prioritization || 'id:asc').split(':')
  if (!isValidSortDirection(sortDirection)) { return null }

  const sanitizedSortBy = (sortBy === 'inserted_at') ? 'id' : sortBy

  return {
    sort: { [sanitizedSortBy]: sortDirection },
    sortBy,
    sortDirection,
    sortString: `${sanitizedSortBy}:${sortDirection}`
  }
}

const stringify = (list: number[]): string[] => list.map(n => n.toString())
const given = <T>(list: T[] | undefined): list is T[] => !!list && list.length > 0

export const getRouteQueryFromV2DatasetItemFilter =
  (originalQuery: Route['query'], filter: V2DatasetItemFilter): Route['query'] => {
    const {
      annotation_class_ids: classIds,
      not_annotation_class_ids: notClassIds,
      assignees: currentAssignees,
      not_assignees: notCurrentAssignees,
      item_names: filenames,
      not_item_names: notFilenames,
      item_name_contains: itemNameContains,
      has_comments: hasComments,
      item_path_prefix: path,
      not_item_path_prefix: notPath,
      item_paths: paths,
      not_item_paths: notPaths,
      sort: previousSort,
      statuses,
      not_statuses: notStatuses,
      workflow_stage_ids: stageIds,
      not_workflow_stage_ids: notStageIds
    } = filter

    const sort = (previousSort && Object.keys(previousSort).length > 0)
      ? `${Object.keys(previousSort)[0]}:${Object.values(previousSort)[0]}`
      : undefined

    const filterKeys = [
      'annotation_class_ids',
      'not_annotation_class_ids',
      'assignees',
      'not_assignees',
      'item_names',
      'not_item_names',
      'item_name_contains',
      'has_comments',
      'item_path_prefix',
      'not_item_path_prefix',
      'item_paths',
      'not_item_paths',
      'sort',
      'statuses',
      'not_statuses',
      'workflow_stage_ids',
      'not_workflow_stage_ids'
    ]

    return {
      ...omit(originalQuery, filterKeys),
      ...(given(classIds) && { annotation_class_ids: stringify(classIds) }),
      ...(given(notClassIds) && { not_annotation_class_ids: stringify(notClassIds) }),
      ...(given(currentAssignees) && { assignees: stringify(currentAssignees) }),
      ...(given(notCurrentAssignees) && { not_assignees: stringify(notCurrentAssignees) }),
      ...(given(filenames) && { item_names: filenames }),
      ...(given(notFilenames) && { not_item_names: notFilenames }),
      ...(itemNameContains && { item_name_contains: itemNameContains }),
      ...(hasComments && { has_comments: 'true' }),
      ...((path && path !== '/') ? { item_path_prefix: path } : {}),
      ...((notPath && notPath !== '/') ? { not_item_path_prefix: notPath } : {}),
      ...(given(paths) && { item_paths: paths }),
      ...(given(notPaths) && { not_item_paths: notPaths }),
      ...(sort && { sort }),
      ...(given(statuses) && { statuses }),
      ...(given(notStatuses) && { not_statuses: notStatuses }),
      ...(given(stageIds) && { workflow_stage_ids: stageIds }),
      ...(given(notStageIds) && { not_workflow_stage_ids: notStageIds })

    }
  }

export const getV2DatasetItemFilterFromRouteQuery =
  (query: Route['query'], defaultSortOptions: SortOptions): V2DatasetItemFilter => {
    const {
      annotation_class_ids: classIds,
      not_annotation_class_ids: notClassIds,
      assignees: currentAssignees,
      not_assignees: notCurrentAssignees,
      item_names: filenames,
      not_item_names: notFilenames,
      item_name_contains: itemNameContains,
      has_comments: hasComments,
      item_path_prefix: path,
      not_item_path_prefix: notPath,
      item_paths: paths,
      not_item_paths: notPaths,
      sort: routeSort,
      statuses,
      not_statuses: notStatuses,
      video_ids: videoIds,
      not_video_ids: notVideoIds,
      workflow_stage_ids: stageIds,
      not_workflow_stage_ids: notStageIds
    } = query

    const sortOptions =
      (routeSort && getSortOptionsFromStringV2(routeSort as string)) ||
      defaultSortOptions

    const filter: V2DatasetItemFilter = { sort: sortOptions.sort }

    const pathFromQuery = parseRouteQueryToString(path)
    if (pathFromQuery) { filter.item_path_prefix = pathFromQuery }

    const notPathFromQuery = parseRouteQueryToString(notPath)
    if (notPathFromQuery) { filter.not_item_path_prefix = notPathFromQuery }

    const itemNameFromQuery = parseRouteQueryToString(itemNameContains)
    if (itemNameFromQuery) { filter.item_name_contains = itemNameFromQuery }

    const classIdsFromQuery = parseRouteQueryToNumberArray(classIds)
    if (classIdsFromQuery) { filter.annotation_class_ids = classIdsFromQuery }

    const notClassIdsFromQuery = parseRouteQueryToNumberArray(notClassIds)
    if (notClassIdsFromQuery) { filter.not_annotation_class_ids = notClassIdsFromQuery }

    const currentAssigneesFromQuery = parseRouteQueryToNumberArray(currentAssignees)
    if (currentAssigneesFromQuery) { filter.assignees = currentAssigneesFromQuery }

    const notCurrentAssigneesFromQuery = parseRouteQueryToNumberArray(notCurrentAssignees)
    if (notCurrentAssigneesFromQuery) { filter.not_assignees = notCurrentAssigneesFromQuery }

    const filenamesFromQuery = parseRouteQueryToStringArray(filenames)
    if (filenamesFromQuery) { filter.item_names = filenamesFromQuery }

    const notFilenamesFromQuery = parseRouteQueryToStringArray(notFilenames)
    if (notFilenamesFromQuery) { filter.not_item_names = notFilenamesFromQuery }

    const pathsFromQuery = parseRouteQueryToStringArray(paths)
    if (pathsFromQuery) { filter.item_paths = pathsFromQuery }

    const notPathsFromQuery = parseRouteQueryToStringArray(notPaths)
    if (notPathsFromQuery) { filter.not_item_paths = notPathsFromQuery }

    const hasCommentsFromQuery = parseRouteQueryToString(hasComments)
    if (hasCommentsFromQuery && hasCommentsFromQuery === 'true') {
      filter.has_comments = true
    }

    const parsedStatuses = parseRouteQueryToStringArray(statuses)
    const polishedStatuses: DatasetItemStatus[] | undefined = parsedStatuses
      ? parsedStatuses.filter(status => isDatasetItemStatus(status)) as DatasetItemStatus[]
      : undefined
    if (polishedStatuses) { filter.statuses = polishedStatuses }

    const notParsedStatuses = parseRouteQueryToStringArray(notStatuses)
    const notPolishedStatuses: DatasetItemStatus[] | undefined = notParsedStatuses
      ? notParsedStatuses.filter(status => isDatasetItemStatus(status)) as DatasetItemStatus[]
      : undefined
    if (notPolishedStatuses) { filter.not_statuses = notPolishedStatuses }

    const videoIdsFromQuery = parseRouteQueryToNumberArray(videoIds)
    if (videoIdsFromQuery) { filter.video_ids = videoIdsFromQuery }

    const notVideoIdsFromQuery = parseRouteQueryToNumberArray(notVideoIds)
    if (notVideoIdsFromQuery) { filter.not_video_ids = notVideoIdsFromQuery }

    const queryStageIds = parseRouteQueryToStringArray(stageIds)
    if (queryStageIds) { filter.workflow_stage_ids = queryStageIds }

    const notQueryStageIds = parseRouteQueryToStringArray(notStageIds)
    if (notQueryStageIds) { filter.not_workflow_stage_ids = notQueryStageIds }

    return filter
  }
