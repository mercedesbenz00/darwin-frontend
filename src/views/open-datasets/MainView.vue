<template>
  <div class="open-main__container">
    <router-view
      v-if="currentDataset.id && dataset && typesLoaded && classesLoaded"
      :dataset="dataset"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import RouteError from '@/router/RouteError'
import { Dataset, DatasetPayload, LoadingStatus, RootState } from '@/store/types'

type QueryParams = { datasetSlug: string, teamSlug: string }

/**
 * Parent route for public dataset routes. Simply handles loading of dataset.
 */
@Component({
  name: 'main-view',
  components: {}
})
export default class MainView extends Vue {
  @State((state: RootState) => state.dataset.currentDataset)
  currentDataset!: Dataset

  @State((state: RootState) => state.workview.dataset)
  dataset!: DatasetPayload | null

  /**
   * Upon receiving route params, trigger a dataset fetch by `teamSlug` and `datasetSlug`
   */
  @Watch('$route.params', { immediate: true })
  async onRouteParamsChange (newParams: QueryParams, oldParams: QueryParams): Promise<void> {
    const { teamSlug, datasetSlug } = newParams

    if (!teamSlug || !datasetSlug) {
      throw new RouteError({ route: this.$route, missingParams: ['teamSlug', 'datasetSlug'] })
    }

    if (!oldParams || teamSlug !== oldParams.teamSlug || datasetSlug !== oldParams.datasetSlug) {
      // load dataset via workview, so it's set both in dataset and workview state
      const { data } = await this.$store.dispatch('workview/loadDataset', { teamSlug, datasetSlug })
      this.$store.dispatch('dataset/loadAndSelectDatasetDetails', { dataset: data })
      this.$store.dispatch('aclass/loadTeamAnnotationClasses', { teamSlug })
    }
  }

  /**
   * Indicates if classes have been loaded from the backend
   *
   * The editor is a vanilla js class and it depends on classes and types being available upon init
   * for many of it's features. Due to this, we need to know at this point, if classes for the
   * current team have been loaded or not, and only render the workview once they have.
   */
  @State(
    (state: RootState) =>
      state.aclass.classes.length > 0 ||
      state.aclass.classesLoadingStatus === LoadingStatus.Loaded
  )
  classesLoaded!: boolean

  /**
   * Indicates if annotation types have been loaded from the backend
   *
   * The editor is a vanilla js class and it depends on classes and types being available upon init
   * for many of it's features. Due to this, we need to know at this point, if classes for the
   * current team have been loaded or not, and only render the workview once they have.
   */
  @State(
    (state: RootState) =>
      state.aclass.types.length > 0 ||
      state.aclass.typesLoadingStatus === LoadingStatus.Loaded
  )
  typesLoaded!: boolean
}
</script>

<style lang="scss" scoped>
.open-main__container {
  height: 100%;
}
</style>
