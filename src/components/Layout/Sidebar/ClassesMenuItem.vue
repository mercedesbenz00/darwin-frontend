<template>
  <sidebar-menu-item-layout
    :class="{ 'sidebar_menu--disabled': disabled }"
    :tag="tag"
    :to="routeLocation"
    @hovered="onHover"
  >
    <template #icon>
      <v2-sidebar-menu-item-icon
        name="classes"
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
import classesRoute from '@/router/classesRoute'

import SidebarMenuItemLayout from './SidebarMenuItemLayout.vue'
import V2SidebarMenuItemIcon from './V2SidebarMenuItemIcon.vue'

export default defineComponent({
  name: 'ClassesMenuItem',
  components: { SidebarMenuItemLayout, V2SidebarMenuItemIcon },
  props: {
    disabled: {
      default: false,
      type: Boolean as PropType<boolean>
    }
  },
  setup (props) {
    const route = useRoute()
    
    const routeLocation: Location = { path: classesRoute.path }

    const label = classesRoute.name || ''
    const hovered: Ref<boolean> = ref(false)

    const onHover = (value: boolean): void => {
      hovered.value = value
    }

    const active = computed((): boolean => {
      return route.path.startsWith(routeLocation.path || '')
    })

    const tag = computed((): string => {
      if (props.disabled) {
        return 'div'
      }
      return 'router-link'
    })

    return {
      active,
      hovered,
      label,
      onHover,
      routeLocation,
      tag,
    }
  }
})
</script>
