import { defineStore } from 'pinia'

import { V2DatasetItemFilter, V2ItemsStageCountsPayload } from '@/store/types'
import { ErrorWithMessage, ParsedValidationError } from '@/utils'
import { loadV2ItemsStageCounts } from '@/utils/backend'

type State = {
  /**
   * All backend paths are scoped to team slug, so we need to hold it in state
   * to be able to perform any backend action
   *
   * Effectively, the store is for a team slug and is emptied when team slug changes.
   */
  teamSlug: string | null
  stageCounts: {
    status: 'unfetched' | 'fetching' | 'fetched' | 'error'
    data: V2ItemsStageCountsPayload | null
    error: ErrorWithMessage | ParsedValidationError | null
  }
}

/**
 * Intended to serve as a place to keep v2 dataset item counts.
 *
 * For now, the general behavior is, we load the counts for a team slug and a
 * set of filters and then replace the data in the store with the response we
 * get.
 *
 * We could also merge existing data in the store with new data
 * being pushed, but at this point, this doesn't really make sense. The
 * filters could change between requests, so we don't gain anything out of it.
 *
 * Later on, for a performance boost, we could tack counts by filter, then
 * use data already in store and fire a "refresh" in the background.
 */
export const useItemCountsStore = defineStore('itemCounts', {
  state: (): State => ({
    teamSlug: null,
    stageCounts: {
      status: 'unfetched',
      data: null,
      error: null
    }
  }),
  actions: {
    /**
     * Sets new team slug into the store and clears out store
     */
    setTeamSlug (slug: string | null): void {
      this.teamSlug = slug
      this.stageCounts.status = 'unfetched'
      this.stageCounts.data = null
      this.stageCounts.error = null
    },

    /**
     * Loads stage counts for the current team slug and the specified filter
     */
    async loadStageCounts (filters: V2DatasetItemFilter) {
      if (!this.teamSlug) {
        console.warn('Tried to load stage counts without setting a team first')
        return
      }

      this.stageCounts.status = 'fetching'
      this.stageCounts.data = null

      const response = await loadV2ItemsStageCounts({ teamSlug: this.teamSlug, filters })

      if ('error' in response) {
        this.stageCounts.status = 'error'
        this.stageCounts.error = response.error
        return { error: response.error }
      }

      this.stageCounts.status = 'fetched'
      this.stageCounts.data = response.data
    }
  }
})
