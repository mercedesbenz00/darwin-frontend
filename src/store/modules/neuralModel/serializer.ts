import { Model, ModelPayload } from './types'

export const deserialize = (data: ModelPayload): Model => ({
  id: data.id,
  name: data.name,
  min: data.min,
  max: data.max,
  training: data.training,
  datasetId: data.dataset_id,
  teamId: data.team_id,
  tier: data.tier,
  type: data.type,
  status: data.status,
  insertedAt: new Date(data.inserted_at),
  updatedAt: new Date(data.updated_at),
  url: data.url
})
