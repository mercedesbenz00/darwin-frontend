<template>
  <div class="configure-section__container">
    <div class="configure-section__head">
      <div class="configure-section__wrapper">
        <h3 class="configure-section__label">
          {{ label }}
        </h3>
      </div>
    </div>
    <div
      class="configure-section__content"
      :style="{ '--bg-color': backgroundColor }"
    >
      <slot />
    </div>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import {
  SidebarConfigureSectionTypes
} from '@/components/Workflow/Sidebar/Views/Configure/Section/types'

@Component({
  name: 'sidebar-configure-section'
})
export default class SidebarConfigureSection extends Vue {
  @Prop({ default: '#FFFFFF', required: false, type: String })
  backgroundColor!: SidebarConfigureSectionTypes['backgroundColor']

  @Prop({ default: 'Default Section Title', required: true, type: String })
  label!: SidebarConfigureSectionTypes['label']
}
</script>

<style lang='scss' scoped>
@import "@/uiKit/assets/index.scss";

.configure-section__container {
  width: 100%;
  height: 100%;
}

.configure-section__head {
  display: block;
  width: 100%;
  height: auto;

  background: $colorNeutralsLight50;
  border-bottom: 1px solid $colorStrokeElevate;;
}

.configure-section__wrapper {
  padding: 2px 10px 2px 12px;
}

.configure-section__label {
  @include typography(md-1, inter, 500);
  color: $colorNeutralsLight700;
}

.configure-section__content {
  display: block;
  width: auto;
  height: auto;

  background: var(--bg-color, #FFFFFF);
}
</style>
