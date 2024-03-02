<template>
  <v-popover
    :delay="100"
    placement="bottom"
    popover-class="toggle-button-popover"
    trigger="hover"
  >
    <button
      class="toggle-button"
      @click="$emit('toggle')"
    >
      <slot />
    </button>

    <template slot="popover">
      <slot name="tooltip" />
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'top-bar-toggle-button' })
export default class TopBarToggleButton extends Vue {
  @Prop({ required: true, type: Boolean })
  on!: boolean
}
</script>

<style lang="scss" scoped>
.toggle-button {
  @include row--center;
  background: transparent;
  position: relative;
  padding: 4px 5px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  transition: background .2s ease;

  &:hover {
    background: $colorAliceShade;
  }

  &:active {
    background: $colorAliceShadow;
  }
}
</style>
