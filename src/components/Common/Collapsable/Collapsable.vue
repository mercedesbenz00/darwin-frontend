<template>
  <div
    class="collapsable"
    :class="{
      'collapsable--collapsed': _collapsed
    }"
  >
    <div
      class="collapsable__header"
      @click.stop.prevent="_collapsed = !_collapsed"
    >
      <h3 class="collapsable__title">
        <slot name="title" />
      </h3>

      <collapsable-icon class="collapsable__icon" />
    </div>
    <div class="collapsable__content">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import CollapsableIcon from './assets/collapsable-icon.svg?inline'

@Component({
  name: 'collapsable',
  components: { CollapsableIcon }
})
export default class Collapsable extends Vue {
  @Prop({ required: false, type: Boolean, default: false })
  collapsed!: boolean

  get _collapsed () {
    return this.collapsed
  }

  set _collapsed (val: boolean) {
    this.$emit('update:collapsed', val)
    if (val) {
      this.$emit('collapsed')
    } else {
      this.$emit('expanded')
    }
  }
}
</script>

<style lang="scss" scoped>
$header-height: 22px;

.collapsable {
  @include col;
  transition: height .2s ease-in-out;
}

.collapsable--collapsed {
  height: $header-height;

  .collapsable__content {
    display: none;
    visibility: hidden;
  }

  .collapsable__icon {
    transform: rotateX(180deg);
  }
}

.collapsable__header {
  @include row--distributed--center;
  margin-bottom: 10px;
  cursor: pointer;
}

.collapsable__title {
  flex: 1;
  @include typography(lg-1, inter, bold);
  color: $color90Black;
}

.collapsable__icon {
  width: 16px;
  height: 16px;
  color: $color90Black;
}

.collapsable__content {
  flex: 1;
  overflow-y: auto;
}
</style>
