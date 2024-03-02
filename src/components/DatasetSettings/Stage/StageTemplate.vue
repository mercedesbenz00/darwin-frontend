<template>
  <div
    class="stage"
    :class="{
      'stage--headerless': !$slots.header,
      'stage--footerless': !$slots.footer
    }"
  >
    <div
      v-if="$slots.header"
      class="stage__header"
    >
      <slot name="header" />
    </div>
    <div class="stage__body">
      <slot name="body" />
    </div>
    <div
      v-if="$slots.footer"
      class="stage__footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'StageTemplate' })
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
:root {
  --stage-template-card-width: 215px;
  --stage-template-card-height: 393px;
  --stage-template-card-footer-height: 36px;
  --stage-template-card-header-height: auto;
}
</style>
<style lang="scss" scoped>

$boxBorder: 2px solid $colorAliceShadow;
$boxBorderRadius: 5px;

.stage {
  width: var(--stage-template-card-width);
  height: var(--stage-template-card-height);
  box-sizing: border-box;

  display: grid;
  grid-template-rows: var(--stage-template-card-header-height) 1fr var(--stage-template-card-footer-height);
  align-items: stretch;

  position: relative;

  border-radius: $boxBorderRadius;
  border: $boxBorder;
  background: $colorAliceBlue;
}

.stage__header,
.stage__footer {
  padding: 0 8px;
  align-items: center;
}

.stage__body {
  padding: 5px;
}

.stage__header {
  display: grid;
  align-items: center;
  column-gap: 5px;

  border-bottom: $boxBorder;
  grid-template-columns: auto 1fr auto auto;

  // We want headers for all stages to be of same height.
  // We also want that height to grow when we hover the editable title.
  // That means the height of the first row in the grid must be auto.
  // Adding padding to .stage__header itself would cause issues wit the rates
  // input, since that one is 22 px and adding 8 padding to that would mean
  // annotate and review stages could grow to up to 40px, while the other stages
  // remain at 37.
  // Adding margin to [contenteditable] instead ensures the header will only
  // grow if the [contenteditable grows]
  [contenteditable] {
    margin: 8px 0;
  }
}

.stage__body {
  // prevents grid blowout on horizontal overflow
  min-width: 0px;
}

.stage__footer {
  border-top: $boxBorder;
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-between;
}

.stage.stage--headerless {
  grid-template-rows: 1fr var(--stage-template-card-footer-height);
}
.stage.stage--footerless {
  grid-template-rows: var(--stage-template-card-header-height) 1fr;
}

.stage.stage.stage--footerless.stage.stage--headerless {
  grid-template-rows: 1fr;;
}

</style>
