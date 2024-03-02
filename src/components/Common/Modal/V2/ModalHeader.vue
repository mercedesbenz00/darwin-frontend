<template>
  <div class="modal-header-v2">
    <slot name="title" />
    <div
      v-if="!hideClose"
      class="modal-header-v2-close-container"
    >
      <button
        class="modal-header-v2-close"
        @click="$emit('close')"
      >
        &#10005;
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'modal-header-v2'
})
export default class ModalHeaderV2 extends Vue {
  @Prop({ required: false, default: false, type: Boolean })
  hideClose!: boolean
}
</script>

<style lang="scss" scoped>
.modal-header-v2 {
  @include row--center;
  justify-content: left;
  width: 100%;
  padding-bottom: 0;
}

.modal-header-v2-close-container {
  position: absolute;

  width: 32px;
  height: 32px;
  border-radius: 16px;

  @include row--center;
  cursor: pointer;
  transition: background .3s;

  &:hover {
    background: $colorBlack8;
  }
}

.modal-header-v2-close {
  @include noSelect;
  color: $colorAliceNight;
  background: transparent;

  &:hover {
    opacity: 0.7;
  }
  &:active {
    opacity: 0.5;
  }
}
</style>
