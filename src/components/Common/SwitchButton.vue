<template>
  <div
    class="switch-button"
    :class="{ 'switch-button--enabled': value }"
    @click="toggle"
  >
    <div class="switch-button__button" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'switch-button' })
export default class SwitchButton extends Vue {
  @Prop({ required: true, type: Boolean })
  value!: boolean

  toggle () {
    this.$emit('input', !this.value)
    this.$emit('change', !this.value)
  }
}
</script>

<style lang="scss" scoped>
$switch-button-size: 18px;
$switch-button-switch-size: 16px;
$switch-transition: all 0.3s ease-in-out;

.switch-button {
  height: $switch-button-size;
  width: calc(#{$switch-button-size} * 2);
  background: $colorAliceShadow;
  border-radius: $switch-button-size;
  box-shadow: inset 0px 2px 3px rgba(145, 169, 192, 0.6);
  transition: $switch-transition;
  cursor: pointer;
}

.switch-button--enabled {
  background-color: $colorFeatherFade;
  box-shadow: inset 0px 2px 3px $colorFeatherTeal;

  .switch-button__button {
    background: $colorAliceShade;
    border-color: $colorAliceShadow;
    box-shadow: 0px 1px 3px rgba(80, 95, 109, 0.3);
    transform: translateX($switch-button-size);
  }
}

.switch-button__button {
  height: $switch-button-switch-size;
  width: $switch-button-switch-size;
  border: 2px solid $colorAliceShadow;
  border-radius: $switch-button-switch-size;
  margin: 1px;
  background: $colorAliceShade;
  transition: $switch-transition;
  box-shadow: 0px 1px 3px rgba(80, 95, 109, 0.3);
}
</style>
