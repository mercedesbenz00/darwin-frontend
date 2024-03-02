<template>
  <class-filter
    ref="classFilter"
    :disabled="disabled"
    :disabled-action-tooltip="disabledActionTooltip"
    :list-only="listOnly"
    :options="filterClassOptions"
    :positive-options="positiveClassIds"
    :negative-options="negativeClassIds"
    @change="onSelectedClassChange"
    @create-tag="createTag"
    @tag="tagSelected"
    @untag="untagSelected"
  />
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  PropType,
  Ref,
  SetupContext
} from 'vue'

import ClassFilter from '@/components/DatasetFiltering/ClassFilter/V2/ClassFilter.vue'
import { ClassFilterItemType } from '@/components/DatasetFiltering/ClassFilter/V2/types'
import { useStore, useToast } from '@/composables'
import { createAnnotationClass } from '@/store/modules/aclass/actions/createAnnotationClass'
import { loadV2DatasetItemCounts } from '@/store/modules/dataset/actions/loadV2DatasetItemCounts'
import { tagSelectedItemsV2 } from '@/store/modules/dataset/actions/tagSelectedItemsV2'
import { untagSelectedItemsV2 } from '@/store/modules/dataset/actions/untagSelectedItemsV2'
import {
  AnnotationClassPayload,
  AnnotationTypePayload,
  DatasetDetailPayload,
  DatasetPayload,
  StoreActionPayload,
  V2DatasetItemFilter
} from '@/store/types'
import { ErrorCodes } from '@/utils/error/errors'

export default defineComponent({
  name: 'V2DatasetManagementSidebarClassFilter',
  components: { ClassFilter },
  props: {
    dataset: {
      required: true,
      type: Object as PropType<DatasetPayload>
    },
    positiveClassIds: {
      required: false,
      type: Array as PropType<number[]>,
      default: () => []
    },
    negativeClassIds: {
      required: false,
      type: Array as PropType<number[]>,
      default: () => []
    },
    disabled: {
      required: false,
      type: Boolean,
      default: false
    },
    disabledActionTooltip: {
      required: false,
      type: String,
      default: 'No items are selected'
    },
    listOnly: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  setup (props, context: SetupContext) {
    const { commit, dispatch, state } = useStore()
    const toast = useToast()
    const classFilter: Ref<InstanceType<typeof ClassFilter> | null> = ref(null)

    const isAllSelected = computed(() => state.dataset.selectedAll)

    const selectedItemIds = computed(() => state.dataset.selectedV2ItemIds)
    const filter: Ref<V2DatasetItemFilter> = computed(() => {
      return state.dataset.datasetItemFilterV2
    })

    const removeInvalidSelectAllParams = (filter: V2DatasetItemFilter): V2DatasetItemFilter => {
      return {
        ...filter,
        item_ids: undefined,
        include_thumbnails: undefined,
        include_workflow_data: undefined,
        page: undefined,
        sort: undefined
      }
    }
    const actionFilter = computed(() => {
      return isAllSelected.value
        ? removeInvalidSelectAllParams({ ...filter.value, select_all: true })
        : { item_ids: selectedItemIds.value }
    })

    const annotationTypes: Ref<AnnotationTypePayload[] | null> = computed(() => {
      return state.aclass.types
    })

    const classCounts: Ref<DatasetDetailPayload['class_counts']> = computed(() => {
      const datasetDetails = state.dataset.datasetDetails.find(d => d.id === props.dataset.id)
      if (!datasetDetails) { return [] }
      return datasetDetails.class_counts
    })

    const classesById: Ref<Record<number, AnnotationClassPayload>> = computed(() => {
      return state.aclass.classesById
    })

    const filterClassOptions: Ref<ClassFilterItemType[]> = computed(() => {
      return classCounts.value
        .map(({ id, count }) => {
          const aclass = classesById.value[id]
          return { id, aclass, label: aclass.name, icon: '', count }
        })
        .filter(({ aclass }) => aclass?.datasets.some(d => d.id === props.dataset.id))
    })

    const onSelectedClassChange = (evt: {
      positiveOptions: number[],
      negativeOptions: number[]
    }): void => {
      context.emit('change', evt)
    }

    const tagAnnotationType: Ref<AnnotationTypePayload | undefined> = computed(() => {
      return (
        annotationTypes.value &&
        annotationTypes.value.find(t => t.name === 'tag')
      ) || undefined
    })

    const createTag = async (keyword: string): Promise<void> => {
      if (!tagAnnotationType.value) { return }
      if (!keyword) { return }

      const payload: StoreActionPayload<typeof createAnnotationClass> = {
        annotationTypeNames: [tagAnnotationType.value.name],
        datasets: [{ id: props.dataset.id }],
        description: keyword,
        images: [],
        metadata: { _color: 'auto' },
        name: keyword
      }
      const response = await dispatch('aclass/createAnnotationClass', payload)
      if (('error' in response) && toast) {
        return toast.warning({ meta: { title: response.error.name } })
      }

      if (classFilter.value) {
        classFilter.value.resetTagInput()
      }

      dispatch(
        'dataset/loadV2DatasetItemCounts',
        { dataset: props.dataset } as StoreActionPayload<typeof loadV2DatasetItemCounts>
      )
      if (toast) {
        toast.success({ meta: { title: 'Tag has been successfully created' } })
      }
    }

    const tagSelected = async (item: ClassFilterItemType): Promise<void> => {
      const payload: StoreActionPayload<typeof tagSelectedItemsV2> = {
        dataset: props.dataset,
        annotationClassId: item.id,
        filters: { ...actionFilter.value }
      }

      const result = await dispatch('dataset/tagSelectedItemsV2', payload)

      if ('error' in result && result.error.code === ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE) {
        commit('billing/SHOW_OUT_OF_STORAGE_DIALOG')
      }

      if (('error' in result) && toast) {
        return toast.warning({ meta: { title: result.error.message } })
      }
      if (toast) {
        toast.success({ meta: { title: 'Tag has been successfully applied' } })
      }
    }

    const untagSelected = async (item: ClassFilterItemType): Promise<void> => {
      const payload: StoreActionPayload<typeof untagSelectedItemsV2> = {
        dataset: props.dataset,
        annotationClassId: item.id,
        filters: {
          ...actionFilter.value
        }
      }

      const response = await dispatch('dataset/untagSelectedItemsV2', payload)

      if (('error' in response) && toast) {
        return toast.warning({ meta: { title: response.error.message } })
      }
      if (toast) {
        toast.success({ meta: { title: 'Tag has been successfully cancelled' } })
      }
    }

    return {
      classFilter,
      filterClassOptions,
      onSelectedClassChange,
      createTag,
      tagSelected,
      untagSelected
    }
  }
})
</script>
