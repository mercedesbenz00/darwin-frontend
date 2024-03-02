<template>
  <custom-table
    v-if="viewMode === 1"
    :table-id="tableId"
    :header-row="headerRowWithSort"
    :data="galleryItems"
    @load-data="onInfiniteScroll"
    uses-infinite-scroll
  >
    <template #default="{ item, index }">
      <table-folder
        v-if="item.type === 'folder'"
        :table-id="tableId"
        :data="item.data"
        :readonly="readonly"
        :url-prefix="openDatasetUrlPrefix"
      />
      <dataset-item-list-item
        v-else
        :row="index"
        :table-id="tableId"
        :data="item.data"
        @select="(args) => onSelect(item.data, !args.selected)"
      />
    </template>
  </custom-table>
  <grid
    v-else
    :items=" isSkeletonMode ? skeletonItems : galleryItems"
    :size-step="sizeStep"
    :loading="itemsLoading"
    :loaded="loaded"
    @select-all="setAllSelections"
    allow-infinite-scroll
    @infinite-scroll="onInfiniteScroll"
  >
    <template #card="{ item: { data, type } }">
      <template v-if="type === 'item'">
        <dataset-item-card
          v-if="readonly"
          :data-v2="data"
          :url-prefix="openDatasetUrlPrefix"
          @select="onSelect(data, $event)"
          @shift-select="onShiftSelect(data, $event)"
        />
        <dataset-item-card
          v-else
          :data-v2="data"
          @select="onSelect(data, $event)"
          @shift-select="onShiftSelect(data, $event)"
        />
      </template>
      <template v-if="type === 'folder'">
        <dataset-folder-card
          :data="data"
          :readonly="readonly"
          :url-prefix="openDatasetUrlPrefix"
        />
      </template>
      <template v-if="type === 'skeleton'">
        <dataset-item-skeleton-card />
      </template>
    </template>
  </grid>
</template>

<script lang='ts'>
import {
  computed,
  defineComponent,
  ref,
  watch,
  PropType,
  SetupContext,
  Ref,
  onBeforeUnmount,
  onMounted
} from 'vue'

import { VIEW_MODE } from '@/components/Common/Gallery/types'
import { Grid, GridItem, SizeStep } from '@/components/Common/Grid'
import { CustomTable } from '@/components/Common/Table/V2/Table'
import { TableFolder } from '@/components/Common/Table/V2/TableFolder'
import DatasetFolderCard
  from '@/components/DatasetManagement/Card/V2/DatasetFolderCard.vue'
import DatasetItemCard
  from '@/components/DatasetManagement/Card/V2/DatasetItemCard.vue'
import DatasetItemSkeletonCard
  from '@/components/DatasetManagement/Card/V2/DatasetItemSkeletonCard.vue'
import { useTable } from '@/components/DatasetManagement/Gallery/useTable'
import DatasetItemListItem
  from '@/components/DatasetManagement/ListItem/DatasetItemListItem/V2/DatasetItemListItem.vue'
import { useRoute, useRouter } from '@/composables/useRouter'
import { useStore } from '@/composables/useStore'
import {
  DatasetFolderPayload,
  V2DatasetItemPayload,
  DatasetPayload,
  V2DatasetItemFilter
} from '@/store/types'
import {
  getRouteQueryFromV2DatasetItemFilter,
  folderHasChildren
} from '@/utils'

import { useDatasetItemsLoader } from './useDatasetItemsLoader'

/**
 * Renders gallery in dataset management and open dataset tabs (base and video).
 *
 * Handles selection and shift selection.
 */
export default defineComponent({
  name: 'V2DatasetItemGallery',
  components: {
    Grid,
    DatasetItemCard,
    DatasetItemSkeletonCard,
    DatasetFolderCard,
    CustomTable,
    TableFolder,
    DatasetItemListItem
  },
  props: {
    dataset: {
      required: true,
      type: Object as PropType<DatasetPayload>
    },
    datasetItems: {
      required: false,
      type: Array as PropType<V2DatasetItemPayload[]>,
      default: () => []
    },
    readonly: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  setup (props, context: SetupContext) {
    const { commit, getters, state } = useStore()
    const route = useRoute()
    const router = useRouter()
    const { tableId, headerRow } = useTable()
    const lastSelected: Ref<V2DatasetItemPayload | null> = ref(null)
    const datasetItemsLoader = useDatasetItemsLoader(props.dataset)
    const datasetItemFilter = computed(() => {
      return state.dataset.datasetItemFilterV2
    })

    watch(() => props.dataset, () => {
      datasetItemsLoader.setDataset(props.dataset)
    })

    const viewMode: Ref<VIEW_MODE> = computed(() => {
      return state.dataset.dataTabViewMode
    })

    const folderEnabled = computed(() => {
      return state.dataset.folderEnabled
    })

    const updateFilter = (nextFilter: V2DatasetItemFilter): void => {
      const queryParams = getRouteQueryFromV2DatasetItemFilter(
        route.query,
        nextFilter
      )
      router.push({ query: queryParams })
    }

    const headerRowWithSort = computed(() => {
      return headerRow.map((col) => {
        if (col.id) {
          return {
            ...col,
            sortAction: (mode: 'asc' | 'desc'): void => {
              updateFilter({
                ...datasetItemFilter.value,
                sort: { [col.id]: mode }
              })
            }
          }
        } else {
          return {
            ...col, sortAction: null
          }
        }
      })
    })

    const columnCount = computed(() => {
      return state.dataset.dataTabColumnCountV2
    })

    const sizeStep = computed(() => {
      return Object.entries(SizeStep).map((val) => val[1])[
        columnCount.value - 1
      ]
    })

    const loaded = computed(() => {
      return !datasetItemsLoader.loading.value
    })

    const currentFolder: Ref<DatasetFolderPayload | null> = computed(() => {
      return getters['dataset/currentPathFolderV2']
    })

    const datasetItems = computed(() => {
      return datasetItemsLoader.datasetItems.value
    })

    const viewModeName = computed(() => {
      return viewMode.value === 0 ? 'card' : 'list'
    })

    watch(() => props.datasetItems, (items) => {
      datasetItemsLoader.setDatasetItems(items)
    })

    watch(datasetItems, () => {
      context.emit('update:dataset-items', datasetItems.value)
    }, { immediate: true })

    const galleryItems = computed(() => {
      const galleryDatasetItems = datasetItems.value.map((item) => ({
        data: item,
        id: item.id,
        type: 'item'
      }))

      if (!folderEnabled.value) {
        return galleryDatasetItems
      }

      const galleryFolderItems = folderHasChildren(currentFolder.value)
        ? currentFolder.value!.children!.reduce((newArray, folder) => {
          if (!datasetItemFilter.value.item_paths || datasetItemFilter.value.item_paths.find(
            itemPath => itemPath === folder.path || itemPath.includes(`${folder.path}/`))
          ) {
            newArray.push({
              data: folder,
              id: folder.path,
              type: 'folder'
            })
          }
          return newArray
        }, [] as GridItem[])
        : []

      return [...galleryFolderItems, ...galleryDatasetItems]
    })

    const skeletonItems = computed(() => {
      const skeletonDatasetItems = []
      for (let i = 0; i < 100; i++) {
        skeletonDatasetItems.push(
          {
            data: null,
            id: i,
            type: 'skeleton'
          }
        )
      }
      return skeletonDatasetItems
    })

    const openDatasetUrlPrefix = computed(() => {
      if (!props.readonly) {
        return undefined
      }
      const {
        teamSlug,
        datasetSlug
      } = route.params
      return `/${teamSlug}/${datasetSlug}`
    })

    const setAllSelections = (selected: boolean): void => {
      commit('dataset/SET_SELECTED_ALL_ITEMS', selected)
      if (selected) {
        const selectedDatasetItemsId = datasetItems.value.map(d => d.id)
        commit('dataset/SET_SELECTED_ITEMS', selectedDatasetItemsId)
      } else {
        commit('dataset/SET_SELECTED_ITEMS', [])
      }
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault()
        event.stopPropagation()
        setAllSelections(true)
      } else if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        setAllSelections(false)
      }
    }

    const onSelect = (item: V2DatasetItemPayload, selected: boolean): void => {
      lastSelected.value = selected ? item : null
      commit('dataset/UPDATE_V2_ITEM_SELECTION', {
        items: [item],
        selected
      })
    }

    /**
     * Triggers when a user holds shift while selecting or deselecting an image
     */
    const onShiftSelect = (item: V2DatasetItemPayload, selected: boolean): void => {
      const currentSelectedIndex = datasetItems.value.findIndex(d => d.id === item.id)
      const lastSelectedIndex = lastSelected.value === null
        ? currentSelectedIndex
        : datasetItems.value.findIndex(d => d.id === (lastSelected.value && lastSelected.value.id))
      const lowerBound = Math.min(lastSelectedIndex, currentSelectedIndex)
      const upperBound = Math.max(lastSelectedIndex, currentSelectedIndex)

      const selection = datasetItems.value.slice(lowerBound, upperBound + 1)

      commit('dataset/UPDATE_V2_ITEM_SELECTION', { items: selection, selected })
    }

    const onInfiniteScroll = (): void => {
      datasetItemsLoader.loadMore()
    }

    onMounted(() => {
      datasetItemsLoader.resolveDatasetItemFilter()
      document.addEventListener('keydown', onKeyDown)
    })

    onBeforeUnmount(() => {
      datasetItemsLoader.resetState()
      document.removeEventListener('keydown', onKeyDown)
    })

    const itemsLoading = computed(() => {
      return (
        (!loaded.value && galleryItems.value.length === 0) ||
        datasetItemsLoader.loading.value
      )
    })

    const isSkeletonMode = computed(() => {
      return (
        (!loaded.value && galleryItems.value.length === 0)
      )
    })

    return {
      tableId,
      headerRowWithSort,
      galleryItems,
      skeletonItems,
      loaded,
      openDatasetUrlPrefix,
      sizeStep,
      viewMode,
      onSelect,
      onShiftSelect,
      onInfiniteScroll,
      setAllSelections,
      viewModeName,
      itemsLoading,
      isSkeletonMode
    }
  }
})
</script>
