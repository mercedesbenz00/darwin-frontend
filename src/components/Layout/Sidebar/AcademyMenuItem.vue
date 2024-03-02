<template>
  <sidebar-menu-item-layout
    tag="router-link"
    :to="route"
    target="_blank"
    @hovered="onHover"
  >
    <template #icon>
      <v2-sidebar-menu-item-icon
        name="academy"
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
import { Ref, defineComponent, ref } from 'vue'
import { RawLocation } from 'vue-router'

import SidebarMenuItemLayout from './SidebarMenuItemLayout.vue'
import V2SidebarMenuItemIcon from './V2SidebarMenuItemIcon.vue'

export default defineComponent({
  name: 'AcademyMenuItem',
  components: { SidebarMenuItemLayout, V2SidebarMenuItemIcon },
  setup () {
    const label: string = 'Academy'
    const route: RawLocation = { name: 'Academy'}

    const hovered: Ref<boolean> = ref(false)

    const onHover = (value: boolean): void => {
      hovered.value = value
    }

    return {
      hovered,
      label,
      onHover,
      route
    }
  }
})
</script>
