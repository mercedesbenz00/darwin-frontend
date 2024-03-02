<template>
  <div class="dataset-management__header">
    <div
      v-tooltip="dataset.name"
      class="dataset-management__header__title"
    >
      {{ dataset.name }}
    </div>
    <div class="dataset-management__header__tools">
      <v2-sort-control
        class="data-management__sort"
        :sort-by="activeSortBy"
        :sort-direction="activeSortDirection"
        @change="onSortUpdated"
      />

      <div class="dataset-management__right-wrapper">
        <div class="data-management__slider-container">
          <slider
            class="data-management__slider"
            :value="sliderValue"
            :min="1"
            :max="8"
            :step="1"
            :variant="sliderVariant"
            @input="onColumnCountChange"
          />
        </div>
        <!-- TODO: Hiding this for now until the table row menu is done -->
        <!-- <segmented-control
          :tabs="views"
          id="dm-layout-view"
          @tabChange="onViewChange"
          variant="large"
        /> -->
        <icon-toggle
          :active="folderEnabled"
          @click="toggleFolder"
        >
          <icon-duotone-view-folder />
        </icon-toggle>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Dictionary, isEqual } from 'lodash'
import {
  computed,
  defineComponent,
  ref,
  watch,
  PropType,
  Ref,
  onBeforeUnmount,
  onMounted
} from 'vue'

import IconDuotoneViewFolder from '@/assets/icons/V2/Duotone/ViewFolder.vue'
import { VIEW_MODE } from '@/components/Common/Gallery/types'
import IconToggle from '@/components/Common/IconToggle/IconToggle.vue'
// TODO: Hiding this for now until the table row menu is done
// import SegmentedControl from '@/components/Common/SegmentedControl/SegmentedControl.vue'
import { Tab } from '@/components/Common/SegmentedControl/types'
import Slider from '@/components/Common/Slider/V2/Slider.vue'
import { SliderVariant } from '@/components/Common/Slider/V2/types'
import V2SortControl from '@/components/DatasetFiltering/V2SortControl.vue'
import { SortOptions } from '@/components/DatasetFiltering/types'
import { useStore } from '@/composables'
import { useRoute, useRouter } from '@/composables/useRouter'
import {
  V2DatasetItemFilter,
  DatasetPayload
} from '@/store/types'
import { getV2DatasetDefaultSortOptions, getRouteQueryFromV2DatasetItemFilter } from '@/utils'

export default defineComponent({
  name: 'DatasetManagementHeader',
  components: {
    IconDuotoneViewFolder,
    Slider,
    V2SortControl,
    IconToggle
  },
  props: {
    dataset: {
      required: true,
      type: Object as PropType<DatasetPayload>
    }
  },
  setup (props) {
    const { commit, state } = useStore()
    const route = useRoute()
    const router = useRouter()

    const editingFilter: Ref<V2DatasetItemFilter> = ref({})
    const searchValue: Ref<string> = ref('')
    const maxColumns: Ref<number> = ref(8)

    const columnCount = computed(() => {
      return state.dataset.dataTabColumnCountV2
    })

    const datasetItemFilter = computed(() => {
      return state.dataset.datasetItemFilterV2
    })

    const folderEnabled = computed(() => {
      return state.dataset.folderEnabled
    })

    const updateMaxColumns = (): void => {
      if (columnCount.value > maxColumns.value) {
        commit('dataset/SET_DATA_TAB_COLUMN_COUNT_V2', maxColumns.value)
      }
    }

    onMounted(() => {
      updateMaxColumns()
      window.addEventListener('resize', updateMaxColumns)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', updateMaxColumns)
    })

    const onViewChange = ({ index }: { index: VIEW_MODE }): void => {
      commit('dataset/SET_DATA_TAB_VIEW_MODE', index)
    }

    const toggleFolder = (): void => {
      commit('dataset/SET_FOLDER_ENABLED', !folderEnabled.value)
    }

    const views: Ref<Tab[]> = computed(() => {
      return [
        {
          id: 'grid',
          label: null,
          iconName: 'icon-duotone-view-grid'
        },
        {
          id: 'table',
          label: null,
          iconName: 'icon-mono-view-list'
        }
      ]
    })

    // Filtering management
    const defaultSortOptions: Ref<SortOptions> = computed(() => {
      const sortOptions = getV2DatasetDefaultSortOptions(props.dataset)
      if (!sortOptions) {
        throw new Error(`Cannot find default sort options from the dataset ${props.dataset.id}`)
      }
      return sortOptions
    })

    const activeSortBy = computed(() => {
      const { sort } = editingFilter.value
      const { sortBy: defaultSortBy } = defaultSortOptions.value
      if (!sort) { return defaultSortBy }
      return Object.keys(sort)[0] || defaultSortBy
    })

    const activeSortDirection = computed(() => {
      const { sort } = editingFilter.value
      const { sortDirection: defaultSortDirection } = defaultSortOptions.value
      if (!sort) { return defaultSortDirection as 'asc' | 'desc' }
      return Object.values(sort)[0] || defaultSortDirection
    })

    watch(datasetItemFilter, () => {
      editingFilter.value = {
        sort: defaultSortOptions.value.sort,
        ...datasetItemFilter.value
      }
    }, { immediate: true })

    const queryParams: Ref<Dictionary<string | (string | null)[]>> = computed(() => {
      return getRouteQueryFromV2DatasetItemFilter(route.query, editingFilter.value)
    })

    // When filter is updated, navigate to the proper routes
    const onFilterUpdated = (): void => {
      if (!isEqual(route.query, queryParams.value)) {
        router.push({
          query: queryParams.value
        })
      }
    }

    const onSortUpdated = (params: Pick<SortOptions, 'sortBy' | 'sortDirection'>): void => {
      const { sortBy, sortDirection } = params
      editingFilter.value.sort = {
        [sortBy]: sortDirection
      }
      onFilterUpdated()
    }

    const onColumnCountChange = (columnCount: number): void => {
      commit(
        'dataset/SET_DATA_TAB_COLUMN_COUNT_V2', columnCount
      )
    }

    return {
      activeSortBy,
      activeSortDirection,
      defaultSortOptions,
      folderEnabled,
      onColumnCountChange,
      onSortUpdated,
      onViewChange,
      searchValue,
      sliderVariant: computed(() => SliderVariant.STEPS),
      sliderValue: computed(() => columnCount.value),
      toggleFolder,
      views
    }
  }
})
</script>

<style lang="scss" scoped>
.dataset-management__header {
  padding: 24px 12px 12px 12px;
  @include col;
}
.dataset-management__header__title {
  @include typography(xl, inter, 500);
  color: $colorContentDefault;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dataset-management__header__tools {
  @include row;
  align-items: center;
}
.dataset-search {
  max-width: 300px;
  margin-right: 4px;
}
.shortcut-icons {
  margin-left: -12px;
}

.dataset-management__right-wrapper {
  display: grid;
  grid-template-columns: repeat(3, min-content);
  grid-gap: 4px;
  align-items: center;

  margin-left: auto;
}

.data-management__slider-container {
  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;
  padding: 0 12px;
  height: 36px;
  border: 1px solid $colorStrokeRaise;
  box-sizing: border-box;
}
.data-management__slider {
  width: 75px;
  :deep(.slider) {
    width: 75px;
  }
  :deep(#slider) {
    width: 75px;
  }
}
</style>
