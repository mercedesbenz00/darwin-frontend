import { DatasetFolderPayload } from '@/store/types'

import { sfh } from './datasets'

const datasetFolder: DatasetFolderPayload = {
  dataset_id: sfh.id,
  path: '/',
  direct_item_count: 5,
  direct_item_count_filtered: 10,
  url: null
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

export const treefiedRootFolder: DatasetFolderPayload = {
  ...rootFolder,
  children: [
    {
      ...fooFolder,
      children: [foobazFolder]
    },
    bazFolder
  ]
}
