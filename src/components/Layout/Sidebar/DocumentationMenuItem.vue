<template>
  <sidebar-menu-item-layout
    tag="router-link"
    :to="routeLocation"
    target="_blank"
    @hovered="onHover"
  >
    <template #icon>
      <v2-sidebar-menu-item-icon
        name="documentation"
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
import { PropType, Ref, defineComponent, ref } from 'vue'
import { RawLocation } from 'vue-router'

import SidebarMenuItemLayout from './SidebarMenuItemLayout.vue'
import V2SidebarMenuItemIcon from './V2SidebarMenuItemIcon.vue'

export default defineComponent({
  name: 'DocumentationMenuItem',
  components: { SidebarMenuItemLayout, V2SidebarMenuItemIcon },
  props: {
    disabled: {
      default: false,
      type: Boolean as PropType<boolean>
    }
  },
  setup () {    
    const label = 'Documentation'
    const routeLocation: RawLocation = { name: 'Documentation' }

    const hovered: Ref<boolean> = ref(false)

    const onHover = (value: boolean): void => {
      hovered.value = value
    }

    return {
      hovered,
      label,
      onHover,
      routeLocation
    }
  }
})
</script>
