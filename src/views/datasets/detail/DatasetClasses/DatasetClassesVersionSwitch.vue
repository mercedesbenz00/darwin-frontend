<template>
  <dataset-classes-v2
    v-if="dataset.version === 2"
    :dataset="dataset"
  />
  <dataset-classes
    v-else
    :dataset="dataset"
  />
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  Ref
} from 'vue'

import { BreadCrumb, useBreadcrumbs } from '@/composables'
import { DatasetPayload } from '@/store/types'
import DatasetClasses from '@/views/datasets/detail/DatasetClasses/V1/DatasetClasses.vue'
import DatasetClassesV2 from '@/views/datasets/detail/DatasetClasses/V2/DatasetClasses.vue'

export default defineComponent({
  name: 'DatasetClassesVersionSwitch',
  components: {
    DatasetClasses,
    DatasetClassesV2
  },
  props: {
    dataset: {
      required: true,
      type: Object as PropType<DatasetPayload>
    }
  },
  setup (props) {
    const breadCrumbs: Ref<BreadCrumb[]> = computed(() => {
      if (props.dataset.version === 2) {
        return [
          { to: '/datasets', name: 'Datasets' },
          { to: `/datasets/${props.dataset.id}/dataset-management`, name: props.dataset.name },
          { name: 'Classes' }
        ]
      } else {
        return [
          { to: '/datasets', name: 'Datasets' },
          { to: `/datasets/${props.dataset.id}/overview`, name: props.dataset.name },
          { to: `/datasets/${props.dataset.id}/classes`, name: 'Classes' }
        ]
      }
    })

    useBreadcrumbs(breadCrumbs)
  }
})
</script>
