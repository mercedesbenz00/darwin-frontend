<template>
  <button
    v-tooltip="tooltip"
    class="toggle"
    :class="{'toggle--selected': selected}"
    @click="$emit('click', $event)"
  >
    <sigma-icon class="toggle__icon" />
    <span
      v-if="label"
      class="toggle__label"
    >Total</span>
  </button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import Avatar from '@/components/Common/Avatar/V1/ResponsiveAvatar.vue'

import SigmaIcon from './SigmaIcon.vue'

@Component({ name: 'all-toggle', components: { Avatar, SigmaIcon } })
export default class AllToggle extends Vue {
  @Prop({ required: false, default: true, type: Boolean })
  label!: boolean

  @Prop({ required: false, default: false, type: Boolean })
  selected!: boolean

  @Prop({ required: false, default: false, type: Boolean })
  multiselect!: boolean

  get tooltip (): string {
    if (!this.multiselect) { return 'Click to show overall stats' }
    return this.selected
      ? 'Click to remove totals from the chart. Shift-click to only show totals.'
      : 'Click to add totals to the chart. Shift-click to only show totals.'
  }
}
</script>

<style lang="scss" scoped>
.toggle {
  opacity: 0.3;
  @include row;
  align-items: center;
  background: transparent;
  transition: opacity .2s ease;
}

.toggle:hover {
  opacity: 0.5;
}

.toggle--selected {
  opacity: 1;
}

.toggle__icon {
  height: 35px;
  width: 35px;
}

.toggle__label {
  margin-left: 10px;
  font-weight: bold;
}

</style>
