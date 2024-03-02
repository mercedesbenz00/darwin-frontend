<template>
  <div class="quick-add">
    <label class="quick-add__label">Quick Add</label>
    <div
      class="quick-add__control"
      :class="{ 'quick-add__control--disabled': disabled }"
    >
      <div
        class="quick-add__clicker"
        @click="$emit('click')"
      >
        <quick-add-icon />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import QuickAddIcon from './assets/quick-add.svg?inline'

@Component({
  name: 'quick-add',
  components: { QuickAddIcon }
})
export default class QuickAdd extends Vue {
  @Prop({ type: Boolean, default: false })
  disabled!: boolean
}
</script>

<style lang="scss" scoped>
.quick-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  width:45px;
  margin-top: -1.4rem;
  flex-shrink: 0;
}
.quick-add__control {
  position: relative;
  @include row;
  justify-content: center;
  width: 39px;
  height: 36px;
  margin-top: 0.5rem;
}

.quick-add__control--disabled {
  .quick-add__clicker {
    pointer-events: none;
    opacity: .3;
  }
}

.quick-add__clicker {
  @include row--center;
  width: 100%;
  height: 100%;
  cursor: pointer;
  background: $colorFeatherLight;
  border-radius: $border-radius-default;
  transition: all .1s;

  :deep(svg) {
    max-width: 70%;
  }

  &:hover {
    background: $colorFeatherTeal;
  }

  &:active {
    background: $colorFeatherFade;
  }
}

.quick-add__label {
  @include typography(sm, default, bold);
  white-space: nowrap;
  color: $colorAliceNight;
  @include noSelect;
}
</style>
