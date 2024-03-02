import { V2DatasetFolderPayload } from '@/store/types'

import { sfh } from './datasets'

const datasetFolder: V2DatasetFolderPayload = {
  dataset_id: sfh.id,
  path: '/',
  unfiltered_item_count: 5,
  filtered_item_count: 10,
  thumbnail_url: null
}

export const rootFolder = {
  ...datasetFolder,
  path: '/'
}

export const fooFolder = {
  ...datasetFolder,
  path: '/foo'
}

export const bazFolder = {
  ...datasetFolder,
  path: '/baz'
}

export const foobazFolder = {
  ...datasetFolder,
  path: '/foo/baz'
}

export const treefiedRootFolder: V2DatasetFolderPayload = {
  ...rootFolder,
  children: [
    {
      ...fooFolder,
      children: [foobazFolder]
    },
    bazFolder
  ]
}
