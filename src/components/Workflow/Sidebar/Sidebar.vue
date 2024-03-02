<template>
  <div class="sidebar">
    <SidebarConfigureView
      v-if="showConfigure"
      class="sidebar__container"
    />
    <SidebarMainView
      v-else
      class="sidebar__container"
    >
      <slot />
    </SidebarMainView>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import SidebarConfigureView from '@/components/Workflow/Sidebar/Views/Configure/Configure.vue'
import SidebarMainView from '@/components/Workflow/Sidebar/Views/Main.vue'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'

export default defineComponent({
  name: 'Sidebar',
  components: {
    SidebarConfigureView,
    SidebarMainView
  },
  setup () {
    const workflowScene = useWorkflowSceneStore()
    const showConfigure = computed(() => !!workflowScene.selectedStage)
    return { showConfigure }
  }
})
</script>

<style lang="scss" scoped>
$sidebarBaseWidth: 288px;
$outerPadding: 8px;

.sidebar {
  position: absolute;
  display: block;
  box-sizing: border-box;
  width: $sidebarBaseWidth;
  height: calc(100% - #{$outerPadding * 2});
  top: $outerPadding;
  right: 7px;
  z-index: var(--z-workflow-sidebar);

  .sidebar__container {
    height: 100%;
    max-height: 100%;
  };
}
</style>
