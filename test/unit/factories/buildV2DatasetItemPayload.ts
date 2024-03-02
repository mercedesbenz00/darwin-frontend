import { V2DatasetItemPayload, DatasetItemStatus, DatasetItemType } from '@/store/types'
type Params = Partial<V2DatasetItemPayload>

export const buildV2DatasetItemPayload =
  (params: Params = {}): V2DatasetItemPayload => ({
    archived: false,
    current_workflow_id: null,
    current_workflow: null,
    slot_types: [DatasetItemType.image],
    workflow_status: DatasetItemStatus.annotate,
    slots: [{
      id: '',
      file_name: '',
      slot_name: '',
      total_sections: 0,
      upload_id: '',
      size_bytes: 0,
      type: DatasetItemType.image
    }],
    layout: {
      type: 'simple',
      slots: ['1'],
      version: 1
    },
    dataset_id: -1,
    id: '1',
    name: '',
    priority: 0,
    processing_status: DatasetItemStatus.new,
    status: DatasetItemStatus.new,
    path: '/',
    uploads: [],
    inserted_at: '2022-02-01T02:00:00.000Z',
    updated_at: '2022-02-02T02:00:00.000Z',
    ...params
  })
