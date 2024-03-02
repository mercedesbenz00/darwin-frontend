<template>
  <div
    class="manipulation-sidebar"
    :class="{ 'manipulation-sidebar--open': open }"
  >
    <div class="manipulation-sidebar__header">
      <button
        class="manipulation-sidebar__button manipulation-sidebar__button--open"
        @click="openSidebar"
      >
        <img src="./assets/icon.svg">
      </button>
      <strong class="manipulation-sidebar__title">Image Manipulation</strong>
      <button
        class="manipulation-sidebar__button manipulation-sidebar__button--close"
        @click="closeSidebar"
      />
    </div>
    <div class="manipulation-sidebar__content">
      <slot>Nothing here yet.</slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'image-manipulation-sidebar' })
export default class ImageManipulationSidebar extends Vue {
  @Prop({ required: true, type: Boolean, default: false })
  open!: boolean

  openSidebar () {
    this.$ga.event('workview', 'open_manipulation_sidebar')
    this.$emit('update:open', true)
    this.$emit('opened')
  }

  closeSidebar () {
    this.$ga.event('workview', 'close_manipulation_sidebar')
    this.$emit('update:open', false)
    this.$emit('closed')
  }
}
</script>

<style lang="scss" scoped>
$sidebar_width: 300px;
$sidebar__header_height: 40px;
$sidebar__header_top: 90px;

.manipulation-sidebar {
  @include workview-sidebar('.manipulation-sidebar', $sidebar_width, $sidebar__header_top, $sidebar__header_height);

  .manipulation {
    height: 100%;
  }
}

.manipulation-sidebar__button {
  img {
    width: 100%;
    height: 100%;
  }
}

.manipulation-sidebar__content {
  overflow-y: auto;
}
</style>
