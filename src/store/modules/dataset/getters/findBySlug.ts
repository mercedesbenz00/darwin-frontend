import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'

// only safe to use for tutorial dataset,
// since that one's slug is effectively unique
export const findBySlug: Getter<DatasetState, RootState> = state =>
  (slug: string) => state.datasets.find(d => d.slug === slug)
