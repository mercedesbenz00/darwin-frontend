import { Ref, watch, onMounted } from 'vue'
import { Location } from 'vue-router'

import { useStore } from '@/composables'

export type BreadCrumb = {
  to?: string | Location,
  name?: string
  slotName?: string
}

export const useBreadcrumbs = (breadCrumbs: Ref<BreadCrumb[]>): void => {
  const { dispatch } = useStore()

  const setBreadCrumbs = (breadCrumbsParam: BreadCrumb[]): void => {
    dispatch('ui/setBreadCrumbs', breadCrumbsParam)
  }

  const setupBreadCrumbs = (): void => {
    if (!breadCrumbs.value) { return }
    setBreadCrumbs(breadCrumbs.value)
  }

  /**
   * Add breadcrumbs to current list and setup to remove them on dismount
   *
   * This function is under a watcher for routes/components where all the data needed to compute
   * breadcrumbs is not available immediately on mount.
   */
  watch(breadCrumbs, () => {
    setupBreadCrumbs()
  })

  onMounted(() => {
    setupBreadCrumbs()
  })
}
