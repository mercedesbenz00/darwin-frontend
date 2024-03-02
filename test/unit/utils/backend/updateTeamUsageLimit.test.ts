import { buildAxiosResponse, buildCustomerSubscriptionPayload } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { CustomerSubscriptionPayload } from '@/store/modules/billing/types'
import { api, errorMessages } from '@/utils'
import { updateTeamUsageLimit } from '@/utils/backend'

mockApi()

let apiPut: jest.SpyInstance
let payload: Parameters<typeof updateTeamUsageLimit>[0]
let response: CustomerSubscriptionPayload

describe('when limiting credits', () => {
  beforeEach(() => {
    payload = { teamSlug: 'v7', credits: 200 }
    response = buildCustomerSubscriptionPayload({
      annotation_credits_standard: 200,
      annotation_credits_standard_max_in_period: 200
    })
    apiPut = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: response }))
  })

  afterEach(() => {
    apiPut.mockReset()
  })

  it('sends request to backend', async () => {
    await updateTeamUsageLimit(payload)
    expect(apiPut).toHaveBeenCalledWith('teams/v7/billing/usage', {
      annotation_credits_standard: 200
    })
  })

  it('returns response from backend', async () => {
    const result = await updateTeamUsageLimit(payload)
    expect(result).toEqual(expect.objectContaining({ data: response }))
  })

  it('parses and returns error on backend error', async () => {
    apiPut.mockRejectedValue(backendUnauthenticatedError)

    const result = await updateTeamUsageLimit(payload)

    expect(result).toEqual({
      error: expect.objectContaining({
        message: errorMessages.TEAM_UPDATE[401],
        status: 401
      })
    })
  })
})

describe('when limiting storage', () => {
  beforeEach(() => {
    payload = { teamSlug: 'v7', storage: 20000 }
    response = buildCustomerSubscriptionPayload({
      storage_standard: 20000,
      storage_standard_max_in_period: 20000
    })
    apiPut = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: response }))
  })

  afterEach(() => {
    apiPut.mockReset()
  })

  it('sends request to backend', async () => {
    await updateTeamUsageLimit(payload)
    expect(apiPut).toHaveBeenCalledWith('teams/v7/billing/usage', {
      storage_standard: 20000
    })
  })

  it('returns response from backend', async () => {
    const result = await updateTeamUsageLimit(payload)
    expect(result).toEqual(expect.objectContaining({ data: response }))
  })

  it('parses and returns error on backend error', async () => {
    apiPut.mockRejectedValue(backendUnauthenticatedError)

    const result = await updateTeamUsageLimit(payload)

    expect(result).toEqual({
      error: expect.objectContaining({
        message: errorMessages.TEAM_UPDATE[401],
        status: 401
      })
    })
  })
})
