<template>
  <dataset-settings-v2
    v-if="dataset.version === 2"
    :dataset="dataset"
  />
  <dataset-settings
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
import DatasetSettings from '@/views/datasets/detail/Settings/V1/DatasetSettings.vue'
import DatasetSettingsV2 from '@/views/datasets/detail/Settings/V2/DatasetSettings.vue'

export default defineComponent({
  name: 'DatasetSettingsVersionSwitch',
  components: {
    DatasetSettings,
    DatasetSettingsV2
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
          { name: 'Settings' }
        ]
      } else {
        return [
          { to: '/datasets', name: 'Datasets' },
          { to: `/datasets/${props.dataset.id}/overview`, name: props.dataset.name },
          { to: `/datasets/${props.dataset.id}/settings`, name: 'Settings' }
        ]
      }
    })

    useBreadcrumbs(breadCrumbs)
  }
})
</script>
