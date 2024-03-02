<template>
  <TabStack
    v-if="dataset"
    :tabs="tabs"
    :size="tabSize"
    :active-tab="activeTab"
    @on-tab-click="onClickTab"
  />
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  Ref
} from 'vue'

import { useRoute, useRouter } from '@/composables/useRouter'
import { DatasetPayload } from '@/store/types'
import { TabSize } from '@/uiKit/TabStack/TabItem/types'
import TabStack from '@/uiKit/TabStack/TabStack.vue'

export default defineComponent({
  name: 'V2DatasetDetailTabs',
  components: { TabStack },
  props: {
    dataset: {
      required: true,
      type: Object as PropType<DatasetPayload>
    }
  },
  setup (props) {
    const route = useRoute()
    const router = useRouter()

    const tabs = computed(() => {
      return [
        {
          id: 'data',
          label: 'Data',
          path: `/datasets/${props.dataset.id}/dataset-management`
        },
        {
          id: 'quality',
          label: 'Quality',
          path: `/datasets/${props.dataset.id}/overview`
        },
        {
          id: 'settings',
          label: 'Settings',
          path: `/datasets/${props.dataset.id}/settings`
        },
        {
          id: 'classes',
          label: 'Classes',
          path: `/datasets/${props.dataset.id}/classes`
        }
      ]
    })

    const activeTab = computed(() => {
      const tabIndex = tabs.value.findIndex(t => route.path === t.path)
      return  (tabIndex > -1) ? tabIndex : 0
    })

    const tabSize: Ref<TabSize> = computed(() => {
      return TabSize.SMALL
    })

    const onClickTab = (index: number): void => {
      router.push(tabs.value[index].path)
    }

    return {
      tabs,
      activeTab,
      tabSize,
      onClickTab
    }
  }
})
</script>
