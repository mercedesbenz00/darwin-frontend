<template>
  <div class="image-manipulation__item">
    <div class="image-manipulation__item__header">
      <label class="image-manipulation__item__label">
        <slot name="label" />
      </label>
      <button
        v-if="optionalSync && $listeners['update:isSyncMode']"
        class="sync-mode-btn"
        :class="{ 'sync-mode-btn--active': isSyncMode }"
        @click="toggleSyncMode"
      >
        <chain-icon v-if="isSyncMode" />
        <unchain-icon v-else />
      </button>
      <button
        v-if="$listeners['refresh']"
        class="image-manipulation__item__button--reset"
        @click="$emit('refresh')"
      >
        <refresh-icon />
      </button>
      <label
        v-if="$slots['value']"
        class="image-manipulation__item__value"
      >
        <slot name="value" />
      </label>
    </div>

    <slot name="others" />

    <div
      v-if="$slots['slider']"
      class="image-manipulation__item__slider"
    >
      <slot name="slider" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { ChainIcon, UnchainIcon } from '@/assets/icons/V1'

import ManipulatorSlider from './ManipulatorSlider.vue'
import RefreshIcon from './assets/refresh.svg?inline'

@Component({
  name: 'image-manipulator',
  components: {
    ManipulatorSlider,
    RefreshIcon,
    ChainIcon,
    UnchainIcon
  }
})
export default class ImageManipulator extends Vue {
  @Prop({ type: Boolean, default: false, required: false })
  isSyncMode!: boolean

  @Prop({ type: Boolean, default: false, required: false })
  optionalSync!: boolean

  toggleSyncMode (): void {
    this.$emit('update:isSyncMode', !this.isSyncMode)
  }
}
</script>

<style lang="scss" scoped>
.image-manipulation__item {
  @include col;
  align-items: center;
  width: 100%;
  &:not(:last-child) {
    margin-bottom: 20px;
  }
}

.image-manipulation__item__header {
  width: 100%;
  @include row;
  justify-content: center;
  margin-bottom: 10px;
}

.image-manipulation__item__label {
  flex: 1;
  width: 100%;
  @include typography(md-1, default);
  @include row;
  align-items: center;
  color: $colorSecondaryDark;
}

.image-manipulation__item__value {
  @include typography(md-1, default);
  min-width: 40px;
  text-align: right;
  color: $colorSecondaryLight;
}

.image-manipulation__item__button--reset {
  @include circle(22px);
  @include typography(md-1, headlines, 600);
  @include row--center;
  padding: 1px 0 0;
  color: transparent;
  background-color: transparent;
  margin: -2px 5px 0 0;
  padding: 5px;

  position: relative;

  &:hover {
    background-color: $colorSecondaryLight2;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.image-manipulation__item__slider {
  width: 100%;
}

.sync-mode-btn {
  @include circle(22px);
  padding: 5px;
  background-color: transparent;
  position: relative;

  &:hover {
    background-color: $colorSecondaryLight2;
  }

  & > svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgb(145, 169, 192);
    width: 15px;
    height: 15px;
    transition: fill .2s ease-in-out;
  }
}

.sync-mode-btn--active {
  & > svg {
    color: $colorBlue;
  }
}
</style>
