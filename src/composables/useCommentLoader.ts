import { watch } from 'vue'

import { useCommentStore } from '@/pinia/useCommentStore'

import { useStore } from './useStore'

export const useCommentLoader = (): void => {
  const store = useStore()
  const commentStore = useCommentStore()

  watch(() => store.state.team.currentTeam?.slug, (slug) => {
    if (!slug) { return }
    commentStore.setTeamSlug(slug)
  }, { immediate: true })

  watch(() => store.state.workview.selectedDatasetItemV2Id, (id) => {
    if (!id) { return }
    commentStore.loadCommentThreads(id)
  }, { immediate: true })
}
