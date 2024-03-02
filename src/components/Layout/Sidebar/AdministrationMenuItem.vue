<template>
  <sidebar-menu-item-layout
    tag="router-link"
    :to="routeLocation"
    @hovered="onHover"
  >
    <template #icon>
      <v2-sidebar-menu-item-icon
        name="admin"
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
import { Location } from 'vue-router'

import { useRoute } from '@/composables/useRouter'
import adminRoute from '@/router/adminRoute'

import SidebarMenuItemLayout from './SidebarMenuItemLayout.vue'
import V2SidebarMenuItemIcon from './V2SidebarMenuItemIcon.vue'

export default defineComponent({
  name: 'AdministrationMenuItem',
  components: { SidebarMenuItemLayout, V2SidebarMenuItemIcon },
  setup () {
    const label = adminRoute.name
    const route = useRoute()
    const routeLocation: Location = { path: adminRoute.path }

    const hovered: Ref<boolean> = ref(false)

    const onHover = (value: boolean): void => {
      hovered.value = value
    }

    const active = computed((): boolean => {
      return route.path.startsWith(routeLocation.path || '')
    })

    return {
      active,
      hovered,
      label,
      onHover,
      routeLocation
    }
  }
})
</script>
