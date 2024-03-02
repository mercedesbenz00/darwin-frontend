<template>
  <div class="open-datasets">
    <div class="open-datasets__main">
      <div class="open-datasets__header">
        <bread-crumbs />
        <div class="open-datasets__header-main">
          <div class="open-datasets__title-wrapper">
            <icon-button
              v-if="parentType"
              v-tooltip="{ placement: 'bottom', content: parentTooltipText, delay: 500 }"
              class="open-datasets-details__title__up"
              :to="parentLocation"
            >
              <up-one-level-icon />
            </icon-button>
            <dataset-title
              v-if="dataset"
              class="open-datasets__title"
              :dataset="dataset"
            />
          </div>
          <div class="open-datasets__header__tabs">
            <tabs :dataset="dataset" />
            <div
              v-if="$slots['header-actions']"
              class="open-datasets__header__actions"
            >
              <slot name="header-actions" />
            </div>
          </div>
        </div>
      </div>
      <div class="open-datasets__content">
        <slot name="content" />
      </div>
    </div>
    <div
      v-if="$slots['sidebar']"
      class="open-datasets__sidebar-container"
    >
      <slot name="sidebar" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Location } from 'vue-router'

import { UpOneLevelIcon } from '@/assets/icons/V1'
import BreadCrumbs from '@/components/Common/BreadCrumbs/V1/BreadCrumbs.vue'
import IconButton from '@/components/Common/Button/V1/IconButton.vue'
import DatasetTitle from '@/components/DatasetManagement/DatasetTitle/DatasetTitle.vue'
import { DatasetPayload } from '@/store/types'

import Tabs from './OpenDatasetDetailTabs.vue'

@Component({
  name: 'open-dataset-detail-layout',
  components: { BreadCrumbs, DatasetTitle, IconButton, Tabs, UpOneLevelIcon }
})
export default class OpenDatasetDetailLayout extends Vue {
  @Prop({ required: true })
  dataset!: DatasetPayload

  @Prop({ default: null })
  parentType!: 'dataset' | 'folder' | null

  @Prop({ default: null })
  parentLocation!: string | Location | null

  get parentTooltipText () {
    return this.parentType === 'folder'
      ? 'Back to Parent Folder'
      : 'Back to Dataset'
  }
}
</script>

<style lang="scss" scoped>
.open-datasets {
  height: 100%;
  overflow: hidden;
  @include row;
}

.open-datasets__main {
  position: relative;
  flex: 1;
  @include col--center;
  max-width: 100%;
  height: 100%;
  overflow: hidden;
}

.open-datasets__header {
  width: 100%;
  padding: 8px 13px 0 45px;
  background: transparent;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  z-index: 1;
  overflow: hidden;
}

.open-datasets__header-main {
  @include row--distributed--center;
  width: 100%;
  height: 40px;
  margin: 0;
  margin-bottom: 10px;
  overflow: hidden;
}

.open-datasets__title-wrapper {
  @include row;
  align-items: center;
  flex: 1;
  margin-right: 20px;
  overflow: hidden;
}

.open-datasets-details__title__up {
  margin-right: 10px;
}

.open-datasets__title {
  font-weight: bold;
  line-height: 35px;
}

.open-datasets__header__tabs {
  height: 100%;
  @include row--center;
  margin-top: -4px;
  overflow: hidden;
}

.open-datasets__header__actions {
  width: 224px;
  min-width: 224px;
  height: 35px;
  margin-left: 26px;
}

.open-datasets__content {
  @include col;
  align-items: center;
  width: 100%;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.open-datasets__sidebar-container {
  height: 100%;
  padding: 20px 13px 13px 13px;
  background: transparent;
  overflow: visible;
}
</style>
