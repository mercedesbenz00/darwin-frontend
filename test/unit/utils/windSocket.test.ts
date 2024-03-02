import { Socket } from 'phoenix'

import { WindAuthAction } from '@/utils/backend'
import * as api from '@/utils/wind/api'
import { WindSocket } from '@/utils/windSocket'

let resolveWindAuth: jest.SpyInstance

jest.mock('phoenix', () => {
  return {
    Socket: jest.fn().mockImplementation(() => {
      return {
        channel: jest.fn().mockReturnValue({
          state: 'joined'
        }),
        channels: [],
        connectionState: jest.fn().mockReturnValue('open')
      }
    })
  }
})

describe('connectAndJoin', () => {
  beforeEach(() => {
    resolveWindAuth = jest.spyOn(api, 'resolveWindAuth').mockResolvedValue({ data: { token: 'a.good' } })
  })

  it('calls Socket constructor', async () => {
    await WindSocket.connectAndJoin('view_models:123')

    const endpoint = 'wss://darwin.v7labs.com/ai/socket'
    const args = { params: { api_key: 'a.good' } }

    expect(Socket).toHaveBeenCalledWith(endpoint, args)
  })

  it('resolves wind authentication correctly', async () => {
    await WindSocket.connectAndJoin('view_models:123')

    const params = {
      action: WindAuthAction.ViewModels,
      teamId: 123
    }

    expect(resolveWindAuth).toHaveBeenCalledWith(params)
  })
})
