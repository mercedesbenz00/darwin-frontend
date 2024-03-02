<template>
  <sidebar-menu-item-layout
    tag="router-link"
    :to="routeLocation"
    @hovered="onHover"
  >
    <template #icon>
      <v2-sidebar-menu-item-icon
        name="workflows"
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
import { PropType, Ref, computed, defineComponent, ref } from 'vue'
import { Location } from 'vue-router'

import { useRoute } from '@/composables'
import { workflowsRoute } from '@/router/workflowsRoute'

import SidebarMenuItemLayout from './SidebarMenuItemLayout.vue'
import V2SidebarMenuItemIcon from './V2SidebarMenuItemIcon.vue'

export default defineComponent({
  name: 'WorkflowsMenuItem',
  components: { SidebarMenuItemLayout, V2SidebarMenuItemIcon },
  props: {
    disabled: {
      default: false,
      type: Boolean as PropType<boolean>
    }
  },
  setup () {
    const route = useRoute()

    const label = workflowsRoute.name || ''
    const routeLocation: Location = { path: workflowsRoute.path }

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
