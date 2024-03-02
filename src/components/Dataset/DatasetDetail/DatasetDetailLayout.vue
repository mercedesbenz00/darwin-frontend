<template>
  <div class="dataset-details">
    <div class="dataset-details__main">
      <div class="dataset-details__header">
        <bread-crumbs />
        <div class="dataset-details__header-main">
          <div class="dataset-details__title-wrapper">
            <icon-button
              v-if="parentType"
              v-tooltip="{ placement: 'bottom', content: parentTooltipText, delay: 500 }"
              class="dataset-details__title__up"
              :to="parentLocation"
            >
              <up-one-level-icon />
            </icon-button>
            <dataset-title
              class="dataset-details__title"
              :dataset="dataset"
              :editable="titleEditable"
              @change="updateTitle"
            />
          </div>
          <div class="dataset-details__header__tabs">
            <tabs :dataset="dataset" />
            <div
              v-if="$slots['header-actions']"
              class="dataset-details__header__actions"
            >
              <slot name="header-actions" />
            </div>
          </div>
        </div>
      </div>
      <div class="dataset-details__content">
        <slot name="content" />
      </div>
    </div>
    <div
      v-if="$slots['sidebar']"
      class="dataset-details__sidebar-container"
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
import Tabs from '@/components/Dataset/DatasetDetail/DatasetDetailTabs.vue'
import DatasetTitle from '@/components/DatasetManagement/DatasetTitle/DatasetTitle.vue'
import { DatasetPayload } from '@/store/types'

@Component({
  name: 'dataset-detail-layout',
  components: { BreadCrumbs, IconButton, DatasetTitle, Tabs, UpOneLevelIcon }
})
export default class DatasetDetailLayout extends Vue {
  @Prop({ required: true })
  dataset!: DatasetPayload

  @Prop({ default: null })
  parentType!: 'dataset' | 'folder' | null

  @Prop({ default: null })
  parentLocation!: string | Location | null

  @Prop({ type: Boolean, default: false })
  titleEditable!: boolean

  get parentTooltipText () {
    return this.parentType === 'folder'
      ? 'Back to Parent Folder'
      : 'Back to Dataset'
  }

  updateTitle (title: string) {
    if (!this.titleEditable) { return }
    this.$emit('change-title', title)
  }
}
</script>

<style lang="scss" scoped>
.dataset-details {
  position: absolute;
  @include fullsize;
  @include row;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.dataset-details__main {
  position: relative;
  flex: 1;
  @include col--center;
  width: calc(100% - 250px);
  height: 100%;
  overflow: hidden;
}

.dataset-details__header {
  width: 100%;
  padding: 8px 13px 0 45px;
  background: transparent;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  overflow: hidden;
  z-index: 1;
}

.dataset-details__header-main {
  @include row--distributed--center;
  width: 100%;
  height: 40px;
  margin: 0;
  margin-bottom: 10px;
  overflow: hidden;
}

.dataset-details__title-wrapper {
  @include row;
  align-items: center;
  flex: 1;
  margin-right: 20px;
  overflow: hidden;
}

.dataset-details__title__up {
  margin-right: 10px;
}

.dataset-details__title {
  font-weight: bold;
  line-height: 35px;
}

.dataset-details__header__tabs {
  height: 100%;
  @include row--center;
  margin-top: -4px;
  overflow: hidden;
}

.dataset-details__header__actions {
  width: 224px;
  min-width: 224px;
  height: 35px;
  margin-left: 26px;
}

.dataset-details__content {
  @include col;
  align-items: center;
  width: 100%;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.dataset-details__sidebar-container {
  height: 100%;
  padding: 20px 13px 13px 13px;
  background: $colorSurfaceBackground;
  border-left: 1px solid rgb(221, 230, 239);
  overflow: visible;
}
</style>
