import { AxiosResponse } from 'axios'

import { post } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse, ParsedError } from '@/utils/error'

export type TilesRequestPayload = { x: number, y: number, z: number }[]
export type PagePayload = {
  from?: string
  to?: string
  offset?: number
  size?: number
}

/* eslint-disable camelcase */
type Params = {
  teamSlug: string
  page?: PagePayload
  tiles?: TilesRequestPayload
  itemId: string
  slotName: string
}
/* eslint-enable camelcase */

export const loadFile =
  async <T>(params: Params): Promise<ParsedError | AxiosResponse<T>> => {
    /* eslint-disable camelcase */
    const { teamSlug, page, tiles, itemId, slotName } = params
    /* eslint-enable camelcase */
    const path =
      `v2/teams/${teamSlug}/items/${itemId}/slots/${slotName}/sections/get`

    try {
      const response = await post<T>(path, {
        page,
        tiles
      })
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.STAGE_LOAD)
    }
  }
