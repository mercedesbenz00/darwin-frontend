<template>
  <div
    class="card"
    :class="{ 'card--selected': isSelected }"
    @click.stop.prevent="toggleSelect"
  >
    <div class="card__thumbnail">
      <card-thumbnail
        :is-dicom="isDicom"
        :is-pdf="isPdf"
        :type="type"
        :url="thumbnail"
      />
      <div class="card__overlay">
        <div
          v-if="$slots['overlay-top-left']"
          class="card__overlay__top-left"
        >
          <slot name="overlay-top-left" />
        </div>
        <div
          v-if="$slots['overlay-top-right']"
          class="card__overlay__top-right"
        >
          <slot name="overlay-top-right" />
        </div>
        <slot
          v-if="$slots['overlay-center']"
          name="overlay-center"
        />
        <div class="card__overlay__tags">
          <span
            v-if="priority"
            :class="priorityClassName"
          >{{ priority }}</span>
          <span
            v-if="isDicom"
            class="card__dicom"
          >DICOM</span>
          <span
            v-if="isPdf"
            class="card__pdf"
          >PDF</span>
          <span
            v-if="isExternal"
            class="card__external"
          >External</span>
        </div>
      </div>

      <img
        v-if="isFolder"
        class="card-thumbnail__folder_overlay"
        src="../../assets/folder.png"
      >

      <div class="card__tags">
        <span
          v-if="isDicom"
          class="card__dicom"
        >DICOM</span>
        <span
          v-if="isPdf"
          class="card__pdf"
        >PDF</span>
        <span
          v-if="isExternal"
          class="card__external"
        >E</span>
      </div>
    </div>
    <div class="card__status">
      <slot name="status" />
    </div>
    <div class="card__details">
      <slot name="details" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import CardThumbnail from '@/components/DatasetManagement/Card/V1/CardThumbnail.vue'

/**
 * Base layout and styles for card v2 components in gallery
 *
 * Renders thumbnail(video indicator) and overlay.
 * Provides slots for action button, status and details area on the bottom.
 * Emits 'select' event.
 * */
@Component({
  name: 'card',
  components: { CardThumbnail }
})
export default class Card extends Vue {
  @Prop({ type: String, default: null })
  thumbnail!: string | null

  @Prop({ default: false, type: Boolean })
  isDicom!: boolean

  @Prop({ default: false, type: Boolean })
  isPdf!: boolean

  @Prop({ default: false, type: Boolean })
  isExternal!: boolean

  @Prop({ default: false, type: Boolean })
  isSelected!: boolean

  @Prop({ default: null })
  priority!: number

  @Prop({ default: 'image', type: String })
  type!: 'folder' | 'image' | 'video' | 'video-frames'

  get isFolder () {
    return this.type === 'folder'
  }

  get priorityClassName () {
    const { priority } = this
    if (!priority) { return '' }
    return `card__overlay__priority card__overlay__priority-${priority <= 5 ? priority : 'over'}`
  }

  toggleSelect (event: MouseEvent) {
    this.$emit('select', event, !this.isSelected)
  }
}
</script>

<style lang="scss" scoped>
$details_height: 60px;

.card {
  height: 100%;
  width: 100%;
  min-width: 100px;
  min-height: 100px;
  background: transparent;
  border-radius: 3px;
  display: inline-block;
  overflow: hidden;
  vertical-align: middle;
  position: relative;

  &:hover {
    .card__overlay {
      @include row--center;
    }

    .card__tags {
      display: none;
    }
  }
}

.card--selected .card__overlay {
  @include row--center;
}

.card__thumbnail {
  @include noSelect;
  flex: 1;
  height: calc(100% - #{$details_height});
  position: relative;
}

.card__overlay {
  position: absolute;
  display: none;
  width: 100%;
  height: 100%;
  border-radius: 3px;
  background: rgba($colorSecondaryDark1, 0.6);
  @include fullsize;
}

.card__overlay__top-left {
  position: absolute;
  top: 8px;
  left: 9px;
}

.card-thumbnail__folder_overlay {
  position: absolute;
  @include fullsize;
  width: 100%;
  height: 100%;
  border-radius: 3px;
  overflow: hidden;
}

.card__tags,
.card__overlay__tags  {
  position: absolute;
  left: 9px;
  bottom: 8px;
  @include col;

  & > *:not(:last-child) {
    margin-bottom: 5px;
  }
}

.card__overlay__priority {
  width: fit-content;
  @include workflow-item-priority-value;
  @include typography(sm, default, bold);
  color: $colorWhite;
  padding: 0 3px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

.card__dicom,
.card__pdf {
  @include typography(sm, default, bold);
  color: $colorWhite;
  text-shadow: 1px 1px 1px rgba(20, 5, 60, 0.2);
}

.card__external {
  @include typography(sm, default, bold);
  color: $colorDarkYellow;
}

.card__overlay__top-right {
  position: absolute;
  top: 10px;
  right: 9px;
  @include col;
  align-items: flex-end;

  :deep(span) {
    font-size: 6px;
    line-height: 10px;
    color: $colorWhite;
    margin-bottom: 2px;
  }
}

.card__status {
  @include noSelect;
  position: absolute;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  bottom: $details_height - 10px;
}

.card__details {
  width: 100%;
  height: $details_height;
  @include col;
  padding: 5px 0 0;
  @include typography(md, default, 600);
}

.card__details > * {
  padding: 1px 0;
}

.card__details > :first-child {
  margin-right: 5px;
  @include ellipsis(1, md-1);
  color: $colorSecondaryDark;
}

.card__details > :nth-child(2) {
  display: flex;
  justify-content: space-between;
  @include typography(sm);
  color: $colorSecondaryLight;
}

.card__details > :nth-child(3) {
  width: 100%;
  @include typography(md, default, normal);
}
</style>
