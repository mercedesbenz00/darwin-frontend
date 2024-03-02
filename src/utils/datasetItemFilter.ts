import isEqual from 'lodash/isEqual'
import omit from 'lodash/omit'
import { Route } from 'vue-router/types/router'

import { SortOptions } from '@/components/DatasetFiltering/types'
import {
  DatasetItemFilter,
  DatasetItemStatus,
  DatasetPayload,
  isDatasetItemStatus
} from '@/store/types'

import {
  parseRouteQueryToNumberArray,
  parseRouteQueryToString,
  parseRouteQueryToStringArray
} from './array'

export const isEqualDatasetItemFilter = (
  filterA: DatasetItemFilter,
  filterB: DatasetItemFilter
): boolean => {
  const filterKeys: (keyof DatasetItemFilter)[] = [
    'annotation_class_ids',
    'not_annotation_class_ids',
    'assignees',
    'not_assignees',
    'current_assignees',
    'not_current_assignees',
    'filenames',
    'not_filenames',
    'has_comments',
    'path',
    'not_path',
    'paths',
    'not_paths',
    'sort',
    'statuses',
    'not_statuses',
    'types',
    'not_types',
    'video_ids',
    'not_video_ids',
    'workflow_stage_template_ids',
    'not_workflow_stage_template_ids',
    'current_workflow_stage_ids',
    'not_current_workflow_stage_ids'
  ]

  return filterKeys.every((key) => isEqual(filterA[key], filterB[key]))
}

const isValidSortDirection =
  (value: string): value is ('asc' | 'desc') => ['asc', 'desc'].includes(value)

export const getSortOptionsFromString = (sortString: string): SortOptions | null => {
  const [sortBy, sortDirection] = sortString.split(':')
  if (!isValidSortDirection(sortDirection)) { return null }
  return {
    sort: { [sortBy]: sortDirection },
    sortString,
    sortBy,
    sortDirection
  }
}

export const getDatasetDefaultSortOptions = (dataset: DatasetPayload): SortOptions | null => {
  if (!dataset.work_prioritization) { return null }
  const [sortBy, sortDirection] = dataset.work_prioritization.split(':')
  if (!isValidSortDirection(sortDirection)) { return null }

  const sanitizedSortBy = sortBy

  return {
    sort: { [sanitizedSortBy]: sortDirection },
    sortBy,
    sortDirection,
    sortString: `${sanitizedSortBy}:${sortDirection}`
  }
}

const stringify = (list: number[]): string[] => list.map(n => n.toString())
const given = <T>(list: T[] | undefined): list is T[] => !!list && list.length > 0

export const getRouteQueryFromDatasetItemFilter =
  (originalQuery: Route['query'], filter: DatasetItemFilter): Route['query'] => {
    const {
      annotation_class_ids: classIds,
      not_annotation_class_ids: notClassIds,
      current_assignees: currentAssignees,
      not_current_assignees: notCurrentAssignees,
      filenames,
      not_filenames: notFilenames,
      has_comments: hasComments,
      path,
      not_path: notPath,
      paths,
      not_paths: notPaths,
      sort: previousSort,
      statuses,
      not_statuses: notStatuses,
      workflow_stage_template_ids: templateIds,
      not_workflow_stage_template_ids: notTemplateIds,
      current_workflow_stage_ids: stageIds,
      not_current_workflow_stage_ids: notStageIds
    } = filter

    const sort = (previousSort && Object.keys(previousSort).length > 0)
      ? `${Object.keys(previousSort)[0]}:${Object.values(previousSort)[0]}`
      : undefined

    const filterKeys = [
      'annotation_class_ids',
      'not_annotation_class_ids',
      'current_assignees',
      'not_current_assignees',
      'filenames',
      'not_filenames',
      'has_comments',
      'path',
      'not_path',
      'paths',
      'not_paths',
      'sort',
      'statuses',
      'not_statuses',
      'workflow_stage_template_ids',
      'not_workflow_stage_template_ids',
      'current_workflow_stage_ids',
      'not_current_workflow_stage_ids'
    ]

    return {
      ...omit(originalQuery, filterKeys),
      ...(given(classIds) && { annotation_class_ids: stringify(classIds) }),
      ...(given(notClassIds) && { not_annotation_class_ids: stringify(notClassIds) }),
      ...(given(currentAssignees) && { current_assignees: stringify(currentAssignees) }),
      ...(given(notCurrentAssignees) && { not_current_assignees: stringify(notCurrentAssignees) }),
      ...(given(filenames) && { filenames }),
      ...(given(notFilenames) && { not_filenames: notFilenames }),
      ...(hasComments && { has_comments: 'true' }),
      ...((path && path !== '/') ? { path } : {}),
      ...((notPath && notPath !== '/') ? { not_path: notPath } : {}),
      ...(given(paths) && { paths }),
      ...(given(notPaths) && { not_paths: notPaths }),
      ...(sort && { sort }),
      ...(given(statuses) && { statuses }),
      ...(given(notStatuses) && { not_statuses: notStatuses }),
      ...(given(templateIds) && { workflow_stage_template_ids: stringify(templateIds) }),
      ...(given(notTemplateIds) && { not_workflow_stage_template_ids: stringify(notTemplateIds) }),
      ...(given(stageIds) && { current_workflow_stage_ids: stageIds }),
      ...(given(notStageIds) && { not_current_workflow_stage_ids: notStageIds })

    }
  }

export const getDatasetItemFilterFromRouteQuery =
  (query: Route['query'], defaultSortOptions: SortOptions): DatasetItemFilter => {
    const {
      annotation_class_ids: classIds,
      not_annotation_class_ids: notClassIds,
      current_assignees: currentAssignees,
      not_current_assignees: notCurrentAssignees,
      filenames,
      not_filenames: notFilenames,
      has_comments: hasComments,
      path,
      not_path: notPath,
      paths,
      not_paths: notPaths,
      sort: routeSort,
      statuses,
      not_statuses: notStatuses,
      video_ids: videoIds,
      not_video_ids: notVideoIds,
      workflow_stage_template_ids: templateIds,
      not_workflow_stage_template_ids: notTemplateIds,
      current_workflow_stage_ids: stageIds,
      not_current_workflow_stage_ids: notStageIds
    } = query

    const sortOptions =
      (routeSort && getSortOptionsFromString(routeSort as string)) ||
      defaultSortOptions

    const filter: DatasetItemFilter = { sort: sortOptions.sort }

    const pathFromQuery = parseRouteQueryToString(path)
    if (pathFromQuery) { filter.path = pathFromQuery }

    const notPathFromQuery = parseRouteQueryToString(notPath)
    if (notPathFromQuery) { filter.not_path = notPathFromQuery }

    const classIdsFromQuery = parseRouteQueryToNumberArray(classIds)
    if (classIdsFromQuery) { filter.annotation_class_ids = classIdsFromQuery }

    const notClassIdsFromQuery = parseRouteQueryToNumberArray(notClassIds)
    if (notClassIdsFromQuery) { filter.not_annotation_class_ids = notClassIdsFromQuery }

    const currentAssigneesFromQuery = parseRouteQueryToNumberArray(currentAssignees)
    if (currentAssigneesFromQuery) { filter.current_assignees = currentAssigneesFromQuery }

    const notCurrentAssigneesFromQuery = parseRouteQueryToNumberArray(notCurrentAssignees)
    if (notCurrentAssigneesFromQuery) {
      filter.not_current_assignees = notCurrentAssigneesFromQuery
    }

    const filenamesFromQuery = parseRouteQueryToStringArray(filenames)
    if (filenamesFromQuery) { filter.filenames = filenamesFromQuery }

    const notFilenamesFromQuery = parseRouteQueryToStringArray(notFilenames)
    if (notFilenamesFromQuery) { filter.not_filenames = notFilenamesFromQuery }

    const pathsFromQuery = parseRouteQueryToStringArray(paths)
    if (pathsFromQuery) { filter.paths = pathsFromQuery }

    const notPathsFromQuery = parseRouteQueryToStringArray(notPaths)
    if (notPathsFromQuery) { filter.not_paths = notPathsFromQuery }

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

    const queryTemplateIds = parseRouteQueryToNumberArray(templateIds)
    if (queryTemplateIds) { filter.workflow_stage_template_ids = queryTemplateIds }

    const notQueryTemplateIds = parseRouteQueryToNumberArray(notTemplateIds)
    if (notQueryTemplateIds) { filter.not_workflow_stage_template_ids = notQueryTemplateIds }

    const queryStageIds = parseRouteQueryToStringArray(stageIds)
    if (queryStageIds) { filter.current_workflow_stage_ids = queryStageIds }

    const notQueryStageIds = parseRouteQueryToStringArray(notStageIds)
    if (notQueryStageIds) { filter.not_current_workflow_stage_ids = notQueryStageIds }

    return filter
  }
