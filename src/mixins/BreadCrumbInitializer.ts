import { Component, Vue, Watch } from 'vue-property-decorator'
import { Location } from 'vue-router'

export type BreadCrumb = {
  to?: string | Location,
  name?: string
  slotName?: string
}

/**
 * DO NOT USE THIS MIXIN
 *
 * If you see it used in a componeted you're modifiying, convert the component
 * to composition api and use the composable. Mixin used to automatically
 * add/remove breadcrumbs from the store,
 *
 *
 * Extends component with facitilites to automatically set breadcrumbs, so they
 * can be rendered in the UI.
 *
 * The mixin requires the component using it to define a `breadCrumbs` data, computed or prop.
 *
 * The property should return the breadcrumbs for the component, or `null`,
 * if the breadcrumbs are not yet ready and will be available later.
 */
@Component
export default class BreadCrumbInitializer extends Vue {
  breadCrumbs!: BreadCrumb[] | null

  setBreadCrumbs (breadCrumbs: BreadCrumb[]): void {
    this.$store.dispatch('ui/setBreadCrumbs', breadCrumbs)
  }

  @Watch('breadCrumbs')
  /**
   * Add breadcrumbs to current list and setup to remove them on dismount
   *
   * This function is under a watcher for routes/components where all the data needed to compute
   * breadcrumbs is not available immediately on mount.
   */
  setupBreadCrumbs (): void {
    const { breadCrumbs } = this
    if (!breadCrumbs) { return }
    this.setBreadCrumbs(breadCrumbs)
  }

  mounted (): void {
    this.setupBreadCrumbs()
  }
}
