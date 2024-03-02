<template>
  <sidebar-menu-item-layout
    tag="router-link"
    :to="settingsPath"
    @hovered="onHover"
  >
    <template #icon>
      <v2-sidebar-menu-item-icon
        :active="active"
        name="settings"
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
import { PropType, Ref, computed, defineComponent, ref } from 'vue'
import { RawLocation } from 'vue-router'

import { useRoute, useRouter } from '@/composables'
import { resolveSettingsRoutePath } from '@/utils/router'

import SidebarMenuItemLayout from './SidebarMenuItemLayout.vue'
import V2SidebarMenuItemIcon from './V2SidebarMenuItemIcon.vue'

export default defineComponent({
  name: 'SettingsMenuItem',
  components: { SidebarMenuItemLayout, V2SidebarMenuItemIcon },
  props: {
    disabled: {
      default: false,
      type: Boolean as PropType<boolean>
    }
  },
  setup () {    
    const label = 'Settings'

    const route = useRoute()
    const router = useRouter()

    const active = computed((): boolean => {
      return !!route.query.settings
    })

    const settingsPath = computed((): RawLocation => {
      return resolveSettingsRoutePath(router, route, 'profile')
    })

    const hovered: Ref<boolean> = ref(false)

    const onHover = (value: boolean): void => {
      hovered.value = value
    }

    return {
      active,
      hovered,
      label,
      onHover,
      settingsPath
    }
  }
})
</script>
