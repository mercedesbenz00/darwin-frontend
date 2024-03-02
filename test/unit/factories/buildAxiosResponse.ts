import { AxiosResponse } from 'axios'

type Params = Partial<AxiosResponse>

export const buildAxiosResponse = (params: Params): AxiosResponse => ({
  data: {},
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
  ...params
})
