<template>
  <div class="tab-select">
    <button
      v-for="option in options"
      :key="option.value"
      v-tooltip="option.description"
      class="tab-select__button"
      :class="{'tab-select__button--active': value === option.value}"
      @click="$emit('change', option.value)"
    >
      {{ option.label || option.value }}
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { TabSelectorOption } from './types'

/**
 * Renders a tablike UI of buttons, one of which has an exclusive active state,
 * toggled when clicked.
 */
@Component({ name: 'tab-selector' })
export default class TabSelector extends Vue {
  @Prop({ required: true, type: String })
  value!: string

  @Prop({ required: true, type: Array as () => TabSelectorOption[] })
  options!: TabSelectorOption[]
}
</script>

<style lang="scss" scoped>
.tab-select {
  @include row;
}

.tab-select__button {
  width: 25%;
  padding: 10px 20px;
  border-radius: 3px;
  background: transparent;

  transition: background-color .2s ease;
  transition: color .2s ease;
  transition: box-shadow .2s ease;

  @include typography(md, default);
  color: $colorSecondaryLight;
  text-transform: capitalize;
  position: relative;
}

.tab-select__button:hover:not(.tab-select__button--active) {
  background: $colorAliceShade;
}

.tab-select__button.tab-select__button--active {
  font-weight: bold;
  color: $colorBlack;
}

.tab-select__button::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  opacity: 0;
  background: $colorBlack;
  width: 80%;
  height: 3px;
  border-top-left-radius: 3px 50%;
  border-bottom-left-radius: 3px 50%;
  border-top-right-radius: 3px 50%;
  border-bottom-right-radius: 3px 50%;
  transition: opacity .2s ease;
}

.tab-select__button.tab-select__button--active::after {
  opacity: 1;
}

.tab-select__button:not(:last-child) {
  margin-right: 15px;
}

</style>
