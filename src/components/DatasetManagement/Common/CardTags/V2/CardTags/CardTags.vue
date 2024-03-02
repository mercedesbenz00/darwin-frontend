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
            v-for="(tag, index) of tags.slice(0, maxItems || tags.length)"
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

import CardTagItem from '@/components/DatasetManagement/Common/CardTags/V2/CardTagItem/CardTagItem.vue'
import { AnnotationClassPayload } from '@/store/types'

@Component({
  name: 'CardTags',
  components: { CardTagItem }
})
export default class CardTags extends Vue {
  @Prop({ required: true })
  tags!: AnnotationClassPayload[]

  @Prop({ type: Number })
  maxItems!: number

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
  align-items: center;
  overflow: hidden;

  .v-popover {
    :deep(> div) {
      display: block !important;
    }
  }
}

.card-status__cells {
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
  flex-shrink: 0;
}

.card-status__label-more {
  @include typography(sm, default, bold);
  color: $colorSecondaryDark1;
  padding: 3px 6px;
  border-radius: 2px;
  margin-left: 4px;
  background: $colorSecondaryLight1;
  height: 18px;
}

:deep(.popover--card-tags) {
  .tooltip-inner {
    background: rgba(31, 31, 31, 0.8);
    padding: 4px;
    border-radius: 3px;
  }
}

:deep(.card-tags-popover) {
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
