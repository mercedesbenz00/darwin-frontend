<template>
  <div
    class="instructions-sidebar"
    :class="{ 'instructions-sidebar--open': open }"
  >
    <div class="instructions-sidebar__header">
      <button
        class="instructions-sidebar__button instructions-sidebar__button--open"
        @click="openSidebar"
      >
        i
      </button>
      <strong class="instructions-sidebar__title">Class Instructions</strong>
      <button
        class="instructions-sidebar__button instructions-sidebar__button--close"
        @click="closeSidebar"
      />
    </div>
    <div class="instructions-sidebar__content">
      <slot>Nothing here yet.</slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'instructions-sidebar' })
export default class InstructionsSidebar extends Vue {
  @Prop({ required: true, type: Boolean, default: false })
  open!: boolean

  openSidebar () {
    this.$ga.event('workview', 'open_instructions_sidebar')
    this.$emit('update:open', true)
    this.$emit('opened')
  }

  closeSidebar () {
    this.$ga.event('workview', 'close_instructions_sidebar')
    this.$emit('update:open', false)
    this.$emit('closed')
  }
}
</script>

<style lang="scss" scoped>
$sidebar_width: 300px;
$sidebar__header_height: 40px;
$sidebar__header_top: 0px;

.instructions-sidebar {
  @include workview-sidebar('.instructions-sidebar', $sidebar_width, $sidebar__header_top, $sidebar__header_height);
  z-index: 4;

  .instructions {
    height: 100%;
  }
}
</style>
