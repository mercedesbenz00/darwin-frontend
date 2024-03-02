<template>
  <div
    v-loading="loading"
    class="dataset-management__sidebar"
    :class="{
      'dataset-management__sidebar--minimized': !hideNotch && minimized,
      'dataset-management__sidebar--back': !isSidebarFront
    }"
    :loading-options="{
      label: loadingLabel,
      backgroundColor: $theme.getColor('colorSurfaceBackground')
    }"
  >
    <div class="dataset-management__sidebar__content">
      <slot />
    </div>
    <div
      v-if="!hideNotch"
      class="dataset-management__sidebar__notch"
      @click.stop="toggleSidebar"
    >
      <img
        src="/static/imgs/notch.svg"
        class="dataset-management__sidebar__notch__icon"
      >
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component({
  name: 'dataset-management-sidebar'
})
export default class Sidebar extends Vue {
  @Prop({ required: false, type: Boolean, default: false })
  loading!: boolean

  @Prop({ required: false, default: null })
  loadingLabel!: string

  @Prop({ required: false, type: Boolean, default: false })
  hideNotch!: boolean

  @State(state => state.ui.isSidebarFront)
  isSidebarFront!: boolean

  minimized: boolean = false;

  toggleSidebar () {
    this.minimized = !this.minimized
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.dataset-management__sidebar {
  position: relative;
  /** required so subcontainers here can scroll */
  width: 224px;
  height: 100%;
  background: $colorSurfaceBackground;
  overflow: visible;
}

.dataset-management__sidebar__content {
  width: 100%;
  height: 100%;
}

.dataset-management__sidebar__notch {
  position: absolute;
  left: -28px;
  bottom: 0;
  width: 15px;
  height: 63px;
  background: url('/static/imgs/notch-rect.svg');
  transform: rotateZ(180deg);
  @include row--center;
  z-index: 800;
  cursor: pointer;
  @include noSelect;
}

.dataset-management__sidebar--minimized {
  width: 0;
  padding: 0;

  .dataset-management__sidebar__content {
    display: none;
  }

  .dataset-management__sidebar__notch__icon {
    transform: rotateZ(180deg);
  }
}

.dataset-management__sidebar--back {
  .dataset-management__sidebar__notch {
    z-index: unset;
  }
}
</style>
