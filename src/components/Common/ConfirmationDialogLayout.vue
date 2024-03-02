<template>
  <div class="dialog-layout">
    <div class="dialog-layout__title">
      <slot name="title" />
    </div>
    <div class="dialog-layout__description">
      <slot name="description" />
    </div>
    <div class="dialog-layout__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Layout for a standard confirmation dialog modal
 *
 * When using this component, you should use scss mixin 'confirmation-dialog-modal'
 * with your modal css class.
 * i.e.
 * .confirmation-dialog {
 *   @include confirmation-dialog-modal;
 * }
 */
export default defineComponent({ name: 'ConfirmationDialogLayout' })
</script>

<style lang="scss" scoped>
.dialog-layout {
  width: 100%;
  @include col--center;
  row-gap: 1.5em;
  border-radius: 5px;
  background: $colorLineGrey;
  padding: 2em 3em;
}

.dialog-layout__title {
  @include typography(lg-1, default, bold);
  text-align: center;
  color: $colorBlack;
}

.dialog-layout__description {
  @include typography(md-1);
  line-height: 24px;
  text-align: center;
  color: $colorBlack;
}

.dialog-layout__footer {
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-around;
  column-gap: 15px;

  > * {
    flex: 1;
    min-width: 160px;
    max-width: 220px;
    padding-left: 0;
    padding-right: 0;
  }

  > :first-child {
    justify-self: start;
  }

  > :last-child {
    justify-self: end;
  }

  > :only-child {
    justify-self: center;
  }
}
</style>
