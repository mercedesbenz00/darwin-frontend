<template>
  <dataset-detail-layout :dataset="dataset">
    <template #content>
      <div class="dataset-management">
        <div class="dataset-management__header">
          <div class="dataset-management__header__tabs">
            <router-link
              v-for="(tab) in tabs"
              :key="tab.name"
              :to="`/datasets/${$route.params.datasetId}/dataset-management/${tab.param}`"
              class="dataset-management__header__tab"
              active-class="dataset-management__header__tab--active"
            >
              {{ tab.name }}
            </router-link>
          </div>
        </div>
        <div class="dataset-management__content">
          <slot name="content" />
        </div>
        <slot name="dialog" />
      </div>
    </template>
    <template #sidebar>
      <slot name="sidebar" />
    </template>
  </dataset-detail-layout>
</template>

<script lang="ts">
/**
 * This component provides layout for tabs under Dataset Management Page
 * This provide slots for actions(top-right corner), main content, sidebar and dialog.
 * <dataset-management-tab>
 *  <slot #actions> <!-- Place buttons to be on the top-right corner --> </slot>
 *  <slot #content> <!-- Place the main contentn of the tab --> </slot>
 *  <slot #sidebar> <!-- Place the sidebar to be placed on the right --> </slot>
 *  <slot #dialog> <!-- Place the dialogs needed for the tab --> </slot>
 * </dataset-management-tab>
 */
import { Component, Prop, Vue } from 'vue-property-decorator'

import DatasetDetailLayout from '@/components/Dataset/DatasetDetail/DatasetDetailLayout.vue'
import { DatasetPayload } from '@/store/types'

@Component({
  name: 'dataset-management-tab',
  components: { DatasetDetailLayout }
})
export default class DatasetManagement extends Vue {
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  tabs: { name: string, param: string }[] = [
    { name: 'Data', param: 'data' },
    { name: 'Tasks', param: 'tasks' },
    { name: 'Review', param: 'review' },
    { name: 'Archive', param: 'archive' }
  ]
}
</script>

<style lang="scss" scoped>
.dataset-management {
  @include col--center;
  width: 100%;
  max-width: 100%;
  height: 100%;
  overflow: hidden;
}

.dataset-management__content {
  @include col--center;
  flex: 1 1 auto;
  width: 100%;
  overflow: hidden;
  margin-top: 10px;
}

// Dataset Management Header
.dataset-management__header {
  @include row;
  margin: 25px 50px 0 50px;
  width: calc(100% - 100px);
  height: 40px;
}

.dataset-management__header__tabs {
  @include row;
  border-radius: 5px;
  background: $colorWhite;
  cursor: pointer;
}

.dataset-management__header__tab {
  @include row--center;
  flex: 1;
  width: 140px;
  @include typography(md-1, headlines);
  line-height: 20px;
  text-align: center;
  color: $colorSecondaryLight;
}

.dataset-management__header__tab--active {
  margin: -2px 0 0 0;
  height: 44px;
  font-weight: 500;
  color: $colorSecondaryDark1;
  background: $colorPrimaryLight;
  border-radius: 5px;

  transition: box-shadow 200ms, background-color 200ms linear, color 200ms linear;
  position: relative;

  &::before {
    content: ' ';
    position: absolute;
    @include fullsize;

    box-shadow: 0px 10px 20px rgba(49, 245, 202, 0.6);
    border-radius: 5px;

    opacity: 0;
    transition: opacity 200ms;
  }

  &:hover::before {
    opacity: 1;
  }
}

.dataset-management__sidebar-container {
  padding: 0;
  height: 100%;
}
</style>
