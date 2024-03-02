<template>
  <div
    class="hotkeys-sidebar"
    :class="{'hotkeys-sidebar--open': open}"
  >
    <div class="hotkeys-sidebar__header">
      <button
        class="hotkeys-sidebar__button hotkeys-sidebar__button--open"
        @click="openSidebar"
      >
        ⌘
      </button>
      <strong class="hotkeys-sidebar__title">Keyboard Shortcuts</strong>
      <button
        class="hotkeys-sidebar__button hotkeys-sidebar__button--close"
        @click="closeSidebar"
      />
    </div>
    <div class="hotkeys-sidebar__content">
      <slot>Nothing here yet.</slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'hotkeys-sidebar' })
export default class HotkeyInfoSidebar extends Vue {
  @Prop({ required: true, type: Boolean, default: false })
  open!: boolean

  openSidebar () {
    this.$ga.event('workview', 'open_hotkeys_sidebar')
    this.$emit('update:open', true)
    this.$emit('opened')
  }

  closeSidebar () {
    this.$ga.event('workview', 'close_hotkeys_sidebar')
    this.$emit('update:open', false)
    this.$emit('closed')
  }
}
</script>

<style lang="scss" scoped>
$sidebar_width: 300px;
$sidebar__header_height: 40px;
$sidebar__header_top: 45px;

.hotkeys-sidebar {
  @include workview-sidebar('.hotkeys-sidebar', $sidebar_width, $sidebar__header_top, $sidebar__header_height);

  .hotkeys {
    height: 100%;
  }
}
</style>
