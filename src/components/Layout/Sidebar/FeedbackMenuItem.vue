<template>
  <!-- id is what the intercom libray uses to handle on-click -->
  <sidebar-menu-item-layout
    :id="id"
    :tag="tag"
    :href="routeLocation"
    target="_blank"
    @hovered="onHover"
  >
    <template #icon>
      <v2-sidebar-menu-item-icon
        name="feedback"
        :active="active"
        :hovered="hovered"
        :tooltip="label"
      />
    </template>
    <template #label>
      {{ label }}
    </template>
  </sidebar-menu-item-layout>
</template>

<script lang="ts">
import { Ref, computed, defineComponent, ref } from 'vue'

import { useIntercom, useStore } from '@/composables'

import SidebarMenuItemLayout from './SidebarMenuItemLayout.vue'
import V2SidebarMenuItemIcon from './V2SidebarMenuItemIcon.vue'

export default defineComponent({
  name: 'FeedbackMenuItem',
  components: { SidebarMenuItemLayout, V2SidebarMenuItemIcon },
  setup () {
    const intercom = useIntercom()
    const { state } = useStore()

    const routeLocation = 'https://v7-community.circle.so/'    

    const hovered: Ref<boolean> = ref(false)

    const onHover = (value: boolean): void => {
      hovered.value = value
    }

    const active = computed((): boolean => {
      return intercom?.visible || false
    })

    const showCommunitySupport = computed((): boolean => {
      return state.billing.billingInfo?.freemium || false
    })

    const label = computed((): string => {
      if (showCommunitySupport.value) {
        return 'Community Support'
      }
      return 'Support'
    })

    const tag = computed((): string => {
      if (showCommunitySupport.value) {
        return 'a'
      }
      return 'div'
    })

    const id = computed((): string => {
      if (showCommunitySupport.value) {
        return 'feedback-trigger-disabled'
      }
      return 'feedback-trigger'
    })

    return {
      active,
      hovered,
      id,
      label,
      onHover,
      routeLocation,
      tag
    }
  }
})
</script>
