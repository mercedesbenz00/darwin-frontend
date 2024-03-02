import { buildDatasetDetailPayload, buildDatasetPayload } from 'test/unit/factories'

import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'

export const datasetThumbnails = [
  'https://res.cloudinary.com/polygonxyz/image/upload/w_100,q_auto/polygon/mock-img/xray01.png',
  'https://res.cloudinary.com/polygonxyz/image/upload/w_100,q_auto/polygon/mock-img/xray01.png',
  'https://res.cloudinary.com/polygonxyz/image/upload/w_100,q_auto/polygon/mock-img/xray01.png',
  'https://res.cloudinary.com/polygonxyz/image/upload/w_100,q_auto/polygon/mock-img/xray01.png'
]

const dataset = buildDatasetPayload({
  id: 883,
  thumbnails: datasetThumbnails,
  num_images: 50,
  num_videos: 10
})

export const datasets = [
  dataset,
  {
    ...dataset,
    id: 1
  },
  {
    ...dataset,
    id: 2
  },
  {
    ...dataset,
    id: 3
  }
]

const datasetDetail = buildDatasetDetailPayload({
  id: 883,
  status_counts: [
    {
      count: 20,
      status: DatasetItemStatus.archived
    },
    {
      count: 21,
      status: DatasetItemStatus.annotate
    },
    {
      count: 20,
      status: DatasetItemStatus.new
    },
    {
      count: 20,
      status: DatasetItemStatus.complete
    }
  ]
})

export const datasetDetails = [
  datasetDetail,
  buildDatasetDetailPayload({
    id: 1,
    status_counts: []
  }),
  buildDatasetDetailPayload({
    id: 2,
    status_counts: []
  }),
  buildDatasetDetailPayload({
    id: 3,
    status_counts: []
  })
]
