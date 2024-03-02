<template>
  <sidebar-menu-item-layout
    :enabled="enabled"
    :tag="tag"
    :to="routeLocation"
    @hovered="onHover"
  >
    <template #icon>
      <v2-sidebar-menu-item-icon
        name="models"
        :active="active"
        :enabled="enabled"
        :hovered="hovered && enabled"
        :tooltip="tooltip"
      />
    </template>
    <template #label>
      {{ label }}
    </template>
    <template
      v-if="!enabled"
      #asside
    >
      <lock-icon />
    </template>
  </sidebar-menu-item-layout>
</template>

<script lang="ts">
import { Ref, computed, defineComponent, ref } from 'vue'
import { Location } from 'vue-router'

import { LockIcon } from '@/assets/icons/V1/sidebar'
import { useRoute, useStore } from '@/composables'
import modelRoute from '@/router/modelRoute'

import SidebarMenuItemLayout from './SidebarMenuItemLayout.vue'
import V2SidebarMenuItemIcon from './V2SidebarMenuItemIcon.vue'

export default defineComponent({
  name: 'ModelsMenuItem',
  components: {
    LockIcon,
    SidebarMenuItemLayout,
    V2SidebarMenuItemIcon
  },
  setup () {
    const route = useRoute()
    
    const label = modelRoute.name || ''
    const routeLocation: Location = { path: modelRoute.path }

    const hovered: Ref<boolean> = ref(false)

    const onHover = (value: boolean): void => {
      hovered.value = value
    }

    const active = computed((): boolean => {
      return route.path.startsWith(routeLocation.path || '')
    })

    const { state } = useStore()

    const enabled = computed((): boolean => {
      return state.team.currentTeam?.neural_models_enabled || false
    })

    const tag = computed((): string => {
      return enabled.value ? 'router-link' : 'div'
    })

    const tooltip = computed((): string => {
      return enabled.value ? label : 'Unavailable for this team'
    })

    return {
      active,
      enabled,
      hovered,
      label,
      onHover,
      routeLocation,
      tag,
      tooltip
    }
  }
})
</script>
