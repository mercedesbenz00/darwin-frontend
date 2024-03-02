<template>
  <div
    ref="containerRef"
    class="card-status_labels"
  >
    <div class="card-status__cells">
      <card-tag-item
        v-for="(tag, index) of tags.slice(0, maxItems || tags.length)"
        :key="index"
        class="card-status__item"
        :data="tag"
      />
      <!-- This is a trick to show the ellpsis at the end of a line -->
      <div class="card-status__overlay">
        <span
          v-for="(tag, index) of tags.slice(0, maxItems || tags.length)"
          :key="`overlay${index}`"
          class="card-status__overlay-text"
        >{{ tag.name }}</span>
      </div>
    </div>
    <v-popover
      v-if="showMore"
      popover-class="popover--card-tags"
      trigger="hover"
    >
      <div class="card-status__label-more">
        ...
      </div>
      <template #popover>
        <div class="card-tags-popover">
          <card-tag-item
            v-for="(tag, index) of tags"
            :key="index"
            :data="tag"
          />
        </div>
      </template>
    </v-popover>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { AnnotationClassPayload } from '@/store/types'

import CardTagItem from './CardTagItem.vue'

@Component({
  name: 'CardTags',
  components: { CardTagItem }
})
export default class CardTags extends Vue {
  @Prop({ required: true })
  tags!: AnnotationClassPayload[]

  @Prop({ type: Number, required: false })
  maxItems!: number | null

  $refs!: Vue['$refs'] & {
    containerRef: HTMLElement
  }

  get showMore (): boolean {
    if (this.maxItems) {
      return this.tags.length > this.maxItems
    }

    return this.tags.length > 0
  }
}
</script>

<style lang="scss" scoped>
.card-status_labels {
  display: flex;
  width: fit-content;
  max-width: 100%;
  overflow: hidden;

  .v-popover:deep(> div) {
    display: block !important;
  }
}

.card-status__cells {
  flex: 1 1 auto;
  display: flex;
  overflow: hidden;
  position: relative;

  & > *:not(:first-child):not(.card-status__overlay) {
    margin-left: 4px;
  }

  & > *:last-child {
    @include ellipsis(1, sm);
  }
}

.card-status__item {
  color: transparent;
}

.card-status__overlay {
  position: absolute;
  top: 2px;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 0;
  @include ellipsis(1, sm);
  @include typography(sm, default, bold);
}

.card-status__overlay-text {
  @include typography(sm, default, bold);
  padding: 2px 3px;
  white-space: nowrap;
  color: $colorSecondaryDark1;

  &:not(:first-child) {
    margin-left: 4px;
  }
}

.card-status__label-more {
  @include typography(sm, default, bold);
  color: $colorSecondaryDark1;
  padding: 2px 3px;
  border-radius: 2px;
  margin-left: 4px;
  background: $colorSecondaryLight1;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.popover--card-tags {
  .tooltip-inner {
    background: rgba(31, 31, 31, 0.8);
    padding: 4px;
    border-radius: 3px;
  }
}
.card-tags-popover {
  @include col;
  max-width: 100px;
  max-height: 500px;

  overflow-y: auto;

  & > * {
    margin-left: 0;
    width: fit-content;
    overflow: hidden;
  }

  & > *:not(:last-child) {
    margin-bottom: 4px;
  }
}
</style>
