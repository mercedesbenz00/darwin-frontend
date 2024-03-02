import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'

// all other datasets's slugs are unique scoped to team slug,
// so both slugs are needed to match
export const findBySlugs: Getter<DatasetState, RootState> = state =>
  (teamSlug: string, datasetSlug: string) =>
    state.datasets.find(d => d.slug === datasetSlug && d.team_slug === teamSlug)
