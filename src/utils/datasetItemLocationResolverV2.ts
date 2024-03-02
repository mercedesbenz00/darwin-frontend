import { Location, Route } from 'vue-router'

import {
  DatasetItemPayload,
  DatasetPayload,
  V2DatasetFolderPayload,
  V2DatasetItemPayload
} from '@/store/types'

/**
 * Resolves folder route in dataset management
 * @param $route route object by vue-router
 * @param data dataset folder
 */
export const resolveFolderDMLocationV2 = (
  $route: Route,
  data: V2DatasetFolderPayload
): Location => ({
  path: `/datasets/${data.dataset_id}/dataset-management/tree${data.path}`,
  query: $route.query
})

/**
 * Resolves folder route in open dataset management
 * @param $route route object by vue-router
 * @param data dataset folder
 * @param urlPrefix url prefix for open dataset - /{teamSlug}/{datasetSlug}
 */
export const resolveOpenFolderDMLocationV2 = (
  $route: Route,
  data: V2DatasetFolderPayload,
  urlPrefix: string
): Location => ({
  path: `${urlPrefix}/tree${data.path}`,
  query: $route.query
})

/**
 * Resolves video item(split video) route in dataset management
 * This function always regards that data.dataset_video_id is always not null
 * @param $route route object by vue-router
 * @param data dataset item
 */
export const resolveSplitVideoDMLocationV2 = (
  $route: Route,
  data: V2DatasetItemPayload
): Location => {
  const { dataset_id: datasetId, id: datasetVideoId } = data
  if (!datasetVideoId) {
    throw new Error('This function requires video item only')
  }
  return {
    name: 'DatasetManagementVideo',
    params: {
      datasetId: datasetId.toString(),
      datasetVideoId: datasetVideoId.toString()
    },
    query: $route.query
  }
}

/**
 * Resolves video item(split video) route in open dataset management
 * This function always regards that data.dataset_video_id is always not null
 * @param $route route object by vue-router
 * @param data dataset item
 */
export const resolveOpenSplitVideoDMLocationV2 = (
  $route: Route,
  data: V2DatasetItemPayload,
  urlPrefix: string
): Location => ({
  path: `${urlPrefix}/videos/${data.id}`,
  query: $route.query
})

/**
 * Resolves video item(annotate as a video) route in dataset management
 * @param $route route object by vue-router
 * @param data dataset item
 */
export const resolveVideoWorkflowLocationV2 = (
  $route: Route,
  data: DatasetItemPayload
): Location => {
  const { dataset_id: datasetId, seq } = data
  const { path } = $route.params

  return {
    name: 'Workflow',
    query: {
      ...$route.query,
      ...(path && path !== '/' ? { path: path.startsWith('/') ? path : `/${path}` } : {}),
      dataset: `${datasetId}`,
      image: `${seq}`
    }
  }
}

/**
 * Resolves image item route in dataset management
 * @param $route route object by vue-router
 * @param data dataset item
 */
export const resolveImageDMLocationV2 = (
  $route: Route,
  data: DatasetItemPayload
): Location => {
  const { dataset_id: datasetId, seq, dataset_image: datasetImage } = data
  const { path } = $route.params

  return {
    name: 'Workflow',
    query: {
      ...$route.query,
      dataset: `${datasetId}`,
      image: `${seq}`,
      ...(path && path !== '/' ? { path: path.startsWith('/') ? path : `/${path}` } : {}),
      ...(
        (datasetImage && datasetImage.dataset_video_id)
          ? { video_ids: `${datasetImage.dataset_video_id}` }
          : {}
      )
    }
  }
}

/**
 * Resolves image item route in open dataset management
 * @param $route route object by vue-router
 * @param data dataset item
 */
export const resolveOpenImageDMLocationV2 = (
  $route: Route,
  data: DatasetItemPayload,
  urlPrefix: string
): Location => {
  const { dataset_image: datasetImage, seq } = data
  const { path } = $route.params

  return {
    path: `${urlPrefix}/${seq}`,
    query: {
      ...$route.query,
      ...(path && path !== '/' ? { path: path.startsWith('/') ? path : `/${path}` } : {}),
      ...(
        (datasetImage && datasetImage.dataset_video_id)
          ? { video_ids: `${datasetImage.dataset_video_id}` }
          : {}
      )
    }
  }
}

/**
 * Resolves dataset management route in workview
 */
export const resolveWorkviewLocationV2 = (
  $route: Route,
  dataset: DatasetPayload
): Location => {
  const { path, query } = $route

  const isOpen = path.startsWith(`/${dataset.team_slug}`)

  let newPath
  if (isOpen) {
    newPath = `/${dataset.team_slug}/${dataset.slug}`
  } else {
    newPath = `/datasets/${dataset.id}/dataset-management`
  }

  const {
    dataset: datasetId,
    image,
    path: folder,
    video_ids: videoIds,
    ...others
  } = query

  // Hand path to dataset management
  if (videoIds) {
    if (videoIds instanceof Array) {
      newPath += `/${videoIds[0]}`
    } else {
      newPath += `/${videoIds}`
    }
  } else if (folder) {
    newPath += `/tree${folder}`
  }

  return {
    path: newPath,
    query: others
  }
}
