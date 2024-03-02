<template>
  <div
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
  >
    <component
      :is="tag"
      class="sidebar__menu"
      :class="{
        'sidebar__menu--disabled': !enabled,
        'sidebar__menu--minimized': minimized
      }"
      v-bind="$attrs"
      @mouseover="onMouseOver"
      @mouseleave="onMouseLeave"
    >
      <slot name="icon" />
      <label class="sidebar__menu__label">
        <slot name="label" />
      </label>
      <div class="sidebar__menu__asside">
        <slot name="asside" />
      </div>
    </component>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component({
  name: 'sidebar-menu-item-layout'
})
export default class SidebarMenuItemLayout extends Vue {
  @Prop({
    required: false,
    default: true,
    type: Boolean as () => boolean
  })
  enabled!: boolean

  @Prop({
    required: false,
    default: 'div',
    type: String as () => string
  })
  tag!: string

  @State(state => state.ui.sidebarMinimized)
  minimized!: boolean

  hovered: boolean = false

  onMouseOver (): void {
    this.hovered = true
    this.$emit('hovered', this.hovered)
  }

  onMouseLeave (): void {
    this.hovered = false
    this.$emit('hovered', this.hovered)
  }
}
</script>

<style lang="scss" scoped>
.sidebar__menu {
  position: relative;
  height: 44px;
  @include noSelect;

  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;

  margin: 2px 10px 0 10px;
  padding: 0 10px;
  border-radius: 8px;

  justify-content: start;
  transition: all .2s;

  column-gap: 11px;
}

:not(.sidebar__menu--pos-bottom) > .sidebar__menu.router-link-active {
  background: $colorOverlayInteractive;
  .sidebar__menu__label {
    color: $colorInteractivePrimaryDefault;
  }
}

.sidebar__menu--minimized {
  grid-template-columns: 1fr;
  justify-content: center;
}

.sidebar__menu--minimized  .sidebar__menu__label,
.sidebar__menu--minimized  .sidebar__menu__asside {
  display: none;
}

.sidebar__menu:hover:not(.router-link-active) .sidebar__menu__label {
  color: $colorInteractivePrimaryDefault;
}

.sidebar__menu--disabled:hover .sidebar__menu__label {
  color: $colorContentDefault !important;
}

.sidebar__menu__label {
  @include typography(md-1, inter, 500);
  color: $colorContentDefault;
  letter-spacing: -0.3px;
}

.sidebar__menu--disabled .sidebar__menu__label {
  opacity: 0.5;
}

.sidebar__menu.has-tooltip .sidebar__menu__label {
  color: $colorInteractivePrimaryDefault;
}

.sidebar__menu.has-tooltip:hover .sidebar__menu__label {
  @include typography(md-1, inter, 500);
  letter-spacing: -0.3px;
}

.sidebar__menu:not(.sidebar_menu--disabled) {
  cursor: pointer;
  .sidebar__menu__label {
    cursor: pointer;
  }
}

.sidebar_menu--disabled {
  opacity: 0.5;
  cursor: not-allowed!important;
}
</style>
