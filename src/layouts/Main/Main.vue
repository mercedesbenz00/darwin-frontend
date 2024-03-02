<template>
  <div class="main">
    <side-bar />
    <div class="content">
      <membership-loader />
      <workflow-loader v-if="authenticated && workflows20" />
      <slot />
      <plan-expired-dialog v-if="authenticated" />
      <out-of-storage-dialog v-if="authenticated" />
    </div>
    <settings-dialog v-if="authenticated" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import OutOfStorageDialog from '@/components/Plans/Product/OutOfStorageDialog.vue'
import PlanExpiredDialog from '@/components/Plans/Product/PlanExpiredDialog.vue'
import MembershipLoader from '@/components/Renderless/MembershipLoader'
import WorkflowLoader from '@/components/Renderless/WorkflowLoader'

import SettingsDialog from './SettingsDialog/SettingsDialog.vue'
import SideBar from './Sidebar/Sidebar.vue'

@Component({
  name: 'main-layout',
  components: {
    MembershipLoader,
    OutOfStorageDialog,
    PlanExpiredDialog,
    SettingsDialog,
    SideBar,
    WorkflowLoader
  }
})
export default class MainLayout extends Vue {
  @State(state => state.auth.authenticated)
  authenticated!: boolean

  get workflows20 (): boolean {
    return this.$featureEnabled('DARWIN_V2_ENABLED')
  }
}
</script>
<style lang="scss" scoped>
.main {
  @include row;
  position: fixed;
  @include fullsize;
}

.content {
  width: calc(100% - #{$sidebarExpandedWidth});
  background: $colorSurfaceBackground;
  position: relative;
  z-index: 800;
  overflow-x: hidden;
}

.sidebar--minimized + .content {
  width: calc(100% - #{$sidebarCollapsedWidth});
}
</style>
