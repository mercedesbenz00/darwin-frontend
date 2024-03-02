<template>
  <PanelFloatingWhite class="sidebar-main">
    <template #header>
      <div class="sidebar-main__header">
        <h3 class="sidebar-main__header__title">
          Add Stages
        </h3>
      </div>
    </template>
    <template #content>
      <div class="sidebar-main__content">
        <slot />
      </div>
    </template>
  </PanelFloatingWhite>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import PanelFloatingWhite from '@/uiKit/Panel/PanelFloatingWhite.vue'

export default defineComponent({
  name: 'SidebarMainView',
  components: { PanelFloatingWhite }
})
</script>

<style lang="scss" scoped>
@import "@/uiKit/assets/index.scss";

.sidebar-main {
  display: grid;
  grid-template-rows: auto 1fr;

  &__header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: $spacing-5;

    &__title {
      @include typography(lg-1, inter, 500);
    }
  }

  :deep(.panel__section:last-child) {
    @include scrollbarV2('vertical');
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $spacing-4;
    padding: $spacing-4 $spacing-5;
    padding-left: $spacing-4;

    @include typography(md-1, default, 500);
  }
}
</style>
