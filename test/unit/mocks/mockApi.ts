import { buildAxiosResponse } from 'test/unit/factories'

import { api } from '@/utils'

const functions: (keyof typeof api)[] = [
  'download',
  'get',
  'logout',
  'post',
  'put',
  'remove',
  'selectTeam',
  'uploadToS3'
]

const createMocks = () => functions.map(fun => jest.spyOn(api, fun)
  .mockResolvedValue(buildAxiosResponse({})))

const resetMocks = () => functions.forEach(fun => (api[fun] as jest.Mock).mockClear())

export const mockApi = () => {
  beforeEach(createMocks)
  afterEach(resetMocks)
}
