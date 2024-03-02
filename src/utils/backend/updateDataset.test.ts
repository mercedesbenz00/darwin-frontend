import { buildDatasetPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { updateDataset } from '@/utils/backend'

mockApi()

let apiPut: jest.SpyInstance

let payload: Parameters<typeof updateDataset>[0]
const sfh = buildDatasetPayload({ id: 3, name: 'sfh' })

beforeEach(() => {
  apiPut = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: sfh }))
  payload = { datasetId: 5 }
})

afterEach(() => {
  apiPut.mockReset()
})

it('requests auth from backend', async () => {
  await updateDataset(payload)
  expect(apiPut).toHaveBeenCalledWith('datasets/5', {})
})

it('converts all supported params properly', async () => {
  // We want all boolean fields set to false, to ensure any defined
  // boolean value is sent to backend
  payload = {
    ...payload,
    annotators: [{ userId: 1 }, { userId: 2 }],
    annotationHotkeys: { 1: 'select_class:1' },
    annotatorsCanCreateTags: false,
    annotatorsCanInstantiateWorkflows: false,
    anyoneCanDoubleAssign: false,
    instructions: 'New instructions',
    name: 'New name',
    pdfFitPage: false,
    public: false,
    reviewersCanAnnotate: false,
    workforceManagers: [
      { managerId: 1, userId: 11, invitationId: 111 },
      { managerId: 2, userId: 22 },
      { managerId: 3, invitationId: 33 },
      { userId: 44 },
      { invitationId: 55 }
    ],
    workPrioritization: 'some:desc',
    workSize: 10

  }
  await updateDataset(payload)
  expect(apiPut).toHaveBeenCalledWith('datasets/5', {
    annotators: [{ user_id: 1 }, { user_id: 2 }],
    annotation_hotkeys: { 1: 'select_class:1' },
    annotators_can_create_tags: false,
    annotators_can_instantiate_workflows: false,
    anyone_can_double_assign: false,
    instructions: 'New instructions',
    name: 'New name',
    pdf_fit_page: false,
    public: false,
    reviewers_can_annnotate: false,
    work_prioritization: 'some:desc',
    work_size: 10,
    workforce_managers: [
      { invitation_id: 111, manager_id: 1, user_id: 11 },
      { manager_id: 2, user_id: 22 },
      { manager_id: 3, invitation_id: 33 },
      { user_id: 44 },
      { invitation_id: 55 }
    ]
  })
})

it('returns response from backend', async () => {
  const response = await updateDataset(payload)
  expect(response).toEqual(expect.objectContaining({ data: sfh }))
})

it('parses and returns error on backend error', async () => {
  apiPut.mockRejectedValue(backendUnauthenticatedError)

  const response = await updateDataset({ datasetId: 2 })

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_UPDATE[401],
      status: 401
    })
  })
})
