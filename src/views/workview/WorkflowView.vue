<template>
  <div>
    <membership-loader />
    <component
      :is="workflowComponent"
      v-if="isLoaded"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  watch,
  onBeforeUnmount
} from 'vue'
import { Vue } from 'vue-property-decorator'
import { NavigationGuardNext, Route } from 'vue-router'

import MembershipLoader from '@/components/Renderless/MembershipLoader'
import {
  useStore,
  useSelectedDatasetItemV2,
  useDatasetItemsV2,
  useDatasetItemsLoader
} from '@/composables'
import { useRoute } from '@/composables/useRouter'
import store from '@/store'
import { loadV2DatasetFolders } from '@/store/modules/dataset/actions/loadV2DatasetFolders'
import {
  DatasetItemPayload,
  DatasetItemStatus,
  DatasetPayload,
  LoadingStatus,
  V2DatasetItemPayload,
  StoreActionPayload
} from '@/store/types'
import { getV2DatasetDefaultSortOptions, getV2DatasetItemFilterFromRouteQuery } from '@/utils'

export default defineComponent({
  name: 'WorkflowView',
  components: {
    MembershipLoader
  },
  /** This component is the route view for several routes including
   *
   * - regular workview
   * - open datasets workview
   * - tutorial workview
   *
   * In case of tutorial, we need to set a flag on the store, indicating we are
   * now in tutorial mode
   */
  async beforeRouteEnter (to: Route, from: Route, next: NavigationGuardNext<Vue>): Promise<void> {
    if (to.name === 'TutorialWorkflow') {
      next(async (vm) => {
        vm.$store.commit('workview/SET_TUTORIAL_MODE', true)
        await store.dispatch('workview/loadDataset')
      })
    } else {
      const datasetId = parseInt(to.query.dataset as string)

      await store.dispatch('workview/loadDataset', { datasetId })
      store.commit('dataset/SET_CURRENT_DATASET_ID', datasetId)

      const dataset = store.state.workview.dataset

      // Annotator mode
      // When item is not exists in url query, request all items
      if (dataset?.version === 2 && !to.query?.item) {
        const sortOptions = getV2DatasetDefaultSortOptions(dataset)
        if (!sortOptions) {
          next()
          return
        }
        const baseFilter = getV2DatasetItemFilterFromRouteQuery(to.query, sortOptions)
        const response = await store.dispatch('dataset/loadV2DatasetItemsList', {
          datasetId,
          teamSlug: dataset.team_slug,
          filter: {
            ...baseFilter,
            page: { size: 1 },
            include_workflow_data: true,
            not_statuses: [
              DatasetItemStatus.processing,
              DatasetItemStatus.uploading,
              DatasetItemStatus.archived
            ],
          }
        })

        if (!response?.data?.items?.at(-1)?.id) {
          next()
          return
        }

        store.commit('dataset/SET_V2_DATASET_ITEMS', response.data.items)

        next({
          ...to,
          query: {
            ...to.query,
            item: response.data.items[0].id
          }
        } as any)

        return
      }

      next()
    }
  },
  beforeRouteUpdate (to: Route, from: Route, next: NavigationGuardNext<Vue>): void {
    if (this.dataset?.version === 2 && to.query?.item) {
      this.setSelectedItem(to.query.item as string)
    }
    next()
  },
  /**
   * When leaving the route, we need to unset the tutorial mode flag
   */
  beforeRouteLeave (to: Route, from: Route, next: NavigationGuardNext<Vue>): void {
    store.commit('workview/SET_TUTORIAL_MODE', false)
    next()
  },
  computed: {
    workflowComponent () {
      if (this.dataset?.version === 2) {
        return () => import('@/components/WorkView/V2/WorkflowWrapper.vue')
      } else {
        return () => import('@/components/WorkView/Workflow.vue')
      }
    }
  },
  setup () {
    const { state, commit, dispatch } = useStore()
    const route = useRoute()

    const datasetItems = computed(() => state.workview.datasetItems)
    const datasetItemsV2 = useDatasetItemsV2()
    const dataset = computed((): DatasetPayload => state.workview.dataset as DatasetPayload)

    const selectedDatasetItemV2 = useSelectedDatasetItemV2()
    const { getDatasetItemFilter } = useDatasetItemsLoader(dataset)

    /**
     * Indicates if classes have been loaded from the backend
     *
     * The editor is a vanilla js class and it depends on classes and types
     * being available upon init for many of it's features.
     *
     * Due to this, we need to know at this point, if classes for the
     * current team have been loaded or not, and only render the workview once
     * they have.
     */
    const classesLoaded = computed(() =>
      state.aclass.classes.length > 0 || state.aclass.classesLoadingStatus === LoadingStatus.Loaded
    )

    /**
     * Indicates if annotation types have been loaded from the backend
     *
     * The editor is a vanilla js class and it depends on classes and types
     * being available upon init for many of it's features.
     *
     * Due to this, we need to know at this point, if classes for the
     * current team have been loaded or not, and only render the workview once
     * they have.
     */
    const typesLoaded = computed(() =>
      state.aclass.types.length > 0 || state.aclass.typesLoadingStatus === LoadingStatus.Loaded
    )

    const setSelectedWork = (seq: number): void => {
      const datasetItems: DatasetItemPayload[] = state.workview.datasetItems
      if (seq === null) { return }

      const selectedDatasetItem =
        datasetItems.find(i => i.seq === seq) ||
        datasetItems.find(i => i.seq > seq)

      if (selectedDatasetItem) {
        commit('workview/SET_SELECTED_DATASET_ITEM', selectedDatasetItem)
      }
    }

    const setSelectedItem = (itemId: V2DatasetItemPayload['id']): void => {
      dispatch('workview/setV2SelectedDatasetItem', itemId)
    }

    const loadFolders = (): void => {
      const payload: StoreActionPayload<typeof loadV2DatasetFolders> = {
        datasetId: dataset.value.id,
        teamSlug: dataset.value.team_slug
      }
      dispatch('dataset/loadV2DatasetFolders', payload)
    }

    const folderEnabled = computed(() => {
      return state.dataset.folderEnabled
    })

    watch(datasetItems, () => {
      const { image: seq, item } = route.query
      setSelectedWork(parseInt(seq as string))

      if (dataset.value?.version === 2 && item) {
        setSelectedItem(item as string)
      }
    }, { immediate: true })

    watch(datasetItemsV2, () => {
      const { item } = route.query

      if (dataset.value?.version === 2 && item) {
        setSelectedItem(item as string)
      }
    }, { immediate: true })

    watch(dataset, () => {
      const { image: seq, item } = route.query
      if (!seq && !item) { return }

      setSelectedWork(parseInt(seq as string))

      if (dataset.value?.version === 2 && item) {
        setSelectedItem(item as string)

        if (folderEnabled.value) {
          loadFolders()
        }
      }
    }, { immediate: true })

    onBeforeUnmount(() => {
      commit('workview/RESET_ALL')
    })

    const isLoaded = computed(() => {
      if (dataset.value?.version === 2) {
        return !!(selectedDatasetItemV2.value && classesLoaded.value && typesLoaded.value)
      }

      return !!(dataset.value && classesLoaded.value && typesLoaded.value)
    })

    watch(() => route.query, () => {
      if (dataset.value?.version !== 2) { return }
      if (!route.query?.item) { return }

      dispatch('dataset/setDatasetItemFilterV2', getDatasetItemFilter())
    }, { immediate: true })

    return {
      dataset,
      setSelectedItem,
      isLoaded
    }
  }
})
</script>
