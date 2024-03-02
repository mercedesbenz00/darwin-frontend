<template>
  <label class="toggle">
    <input
      class="toggle__input"
      type="checkbox"
      :checked="value"
      v-on="$listeners"
    >
    <div
      class="toggle__slider"
      @click.stop
    />
    <div v-if="$slots.default"><slot /></div>
  </label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'toggle' })
export default class Toggle extends Vue {
  @Prop({ required: false, type: Boolean, default: false })
  value!: boolean
}
</script>

<style lang="scss" scoped>
$height: 1.4rem;
$transitionDuration: .1s;

.toggle {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.toggle__input {
  display: none;
}

.toggle__slider {
  display: inline-block;
  width: 2 * $height;
  height: $height;
  padding: 1px;
  border: 1px solid rgba($colorSecondaryLight, .2);
  border-radius: $height;
  background-color: rgba($colorFeatherLight, 0);
  box-shadow: 0 1px 4px 1px rgba(0, 0, 0, .1) inset;
  transition: background-color $transitionDuration;
}

.toggle__slider:not(:last-child) {
  margin-right: 8px;
}

.toggle__slider::before {
  content: '';
  display: block;
  aspect-ratio: 1 / 1;
  height: 100%;
  border-radius: 50%;
  background-color: $colorSecondaryLight;
  transform: translateX(0);
  transition: transform $transitionDuration;
}

.toggle__input:checked + .toggle__slider {
  background-color: rgba($colorFeatherLight, 1);
  transition: background-color $transitionDuration;
}

.toggle__input:checked + .toggle__slider::before {
  background-color: $colorFeatherFadeLight;
  transform: translateX($height);
  transition: background-color $transitionDuration, transform $transitionDuration;
}
</style>
