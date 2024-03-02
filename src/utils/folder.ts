import { DatasetFolderPayload, V2DatasetFolderPayload } from '@/store/types'

/**
 * Normalize the folder path
 *
 * Folder path is required to start with `/` and not to end with '/'.
 * Folder path should not include continuous slash like '//' or '///'.
 *
 * @param path random string
 * @returns normlized folder path
 */
export const normalizeFolderPath = (path: string): string => {
  let normalizedPath = path.replace(/(\/)+/g, '/')
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath
  }
  if (normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1)
  }
  return normalizedPath
}

/* eslint-disable camelcase */
const buildEmptyFolder = (path: string, dataset_id: number): DatasetFolderPayload => ({
  dataset_id,
  path,
  direct_item_count: 0,
  direct_item_count_filtered: 0,
  url: null,
  children: []
})

const buildEmptyFolderV2 = (path: string, dataset_id: number): V2DatasetFolderPayload => ({
  dataset_id,
  path,
  filtered_item_count: 0,
  unfiltered_item_count: 0,
  thumbnail_url: null,
  children: []
})
/* eslint-enable camelcase */

const addFolderToTree = (
  folder: DatasetFolderPayload,
  tree: DatasetFolderPayload[]
): DatasetFolderPayload[] => {
  const segments = folder.path === '/' ? ['/'] : folder.path.split('/')
  let ptr = tree

  segments.forEach((_, index) => {
    const path = segments.slice(0, index + 1).join('/') || '/'
    const nodeIdx = ptr.findIndex(f => f.path === path)

    let node
    if (nodeIdx === -1) {
      node = {
        ...buildEmptyFolder(path, folder.dataset_id),
        ...(index === segments.length - 1 && folder)
      }
      ptr.push(node)
    } else if (index === segments.length - 1) {
      node = {
        ...ptr[nodeIdx],
        ...folder,
        children: ptr[nodeIdx].children || []
      }
      ptr.splice(nodeIdx, 1, node)
    } else {
      node = ptr[nodeIdx]
    }

    ptr = node.children || []
  })
  return tree
}

const addFolderToTreeV2 = (
  folder: V2DatasetFolderPayload,
  tree: V2DatasetFolderPayload[]
): V2DatasetFolderPayload[] => {
  const segments = folder.path === '/' ? ['/'] : folder.path.split('/')
  let ptr = tree

  segments.forEach((_, index) => {
    const path = segments.slice(0, index + 1).join('/') || '/'
    const nodeIdx = ptr.findIndex(f => f.path === path)

    let node
    if (nodeIdx === -1) {
      node = {
        ...buildEmptyFolderV2(path, folder.dataset_id),
        ...(index === segments.length - 1 && folder)
      }
      ptr.push(node)
    } else if (index === segments.length - 1) {
      node = {
        ...ptr[nodeIdx],
        ...folder,
        children: ptr[nodeIdx].children || []
      }
      ptr.splice(nodeIdx, 1, node)
    } else {
      node = ptr[nodeIdx]
    }

    ptr = node.children || []
  })
  return tree
}

/**
 * Convert the folders array into tree structure.
 *
 * If the folders are passed as parameters like the followings:
 * [
 *  { path: '/' },
 *  { path: '/test1' },
 *  { path: '/test2/test' }
 * ]
 *
 * The this returns like the followings:
 * [
 *  {
 *    path: '/',
 *    children: [
 *      { path: '/test1' },
 *      {
 *        path: '/test2',
 *        children: [{ path: '/test2/test' }]
 *      }
 *    ]
 *  }
 * ]
 *
 * @param folders array of dataset folders
 * @returns treefied array of dataset folders
 */
export const treeify = (
  folders: DatasetFolderPayload[],
  datasetId: number
): DatasetFolderPayload[] => {
  const rootFolder: DatasetFolderPayload =
    folders.find(folder => folder.path === '/') ||
    buildEmptyFolder('/', datasetId)
  rootFolder.children = []

  const tree: DatasetFolderPayload[] = [rootFolder]
  folders.forEach(folder => {
    addFolderToTree(folder, tree)
  })
  return tree
}

export const treeifyV2 = (
  folders: V2DatasetFolderPayload[],
  datasetId: number
): V2DatasetFolderPayload[] => {
  const rootFolder: V2DatasetFolderPayload =
    folders.find(folder => folder.path === '/') ||
    buildEmptyFolderV2('/', datasetId)
  rootFolder.children = []

  const tree: V2DatasetFolderPayload[] = [rootFolder]
  folders.forEach(folder => {
    addFolderToTreeV2(folder, tree)
  })
  return tree
}

export const folderHasChildren = (
  folder: DatasetFolderPayload | V2DatasetFolderPayload | null
): boolean => {
  return !!(folder && folder.children && folder.children.length > 0)
}

export const getFolderName = (path: string): string => {
  if (path === '/') { return '/' }
  const segments = path.split('/')
  return segments[segments.length - 1]
}
