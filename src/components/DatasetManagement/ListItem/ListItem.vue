<template>
  <div
    class="list-item"
    :class="{'list-item--selected': isSelected}"
    @click.stop.prevent="onSelect"
  >
    <div class="list-item__checkbox">
      <check-box
        v-if="!isFolder"
        name="item-selected"
        :value="isSelected"
        size="small"
      />
    </div>
    <div class="list-item__content">
      <div class="list-item__thumbnail">
        <folder-icon
          v-if="isFolder"
          class="list-item__thumbnail__folder"
        />
        <img
          v-else
          v-lazy="thumbnail"
          class="list-item__thumbnail__img"
        >
        <video-overlay-icon
          v-if="isVideo"
          class="list-item__thumbnail__video_overlay"
        />
        <frames-overlay-icon
          v-if="isVideoFrames"
          class="list-item__thumbnail__video_overlay"
        />

        <div
          v-if="$slots['overlay']"
          class="list-item__overlay"
        >
          <slot name="overlay" />
        </div>
      </div>
      <div class="list-item__file_name">
        <dataset-item-name :name="name" />
      </div>
      <div class="list-item__status">
        <slot name="status" />
      </div>
      <div class="list-item__created_at">
        {{ formattedDate }}
      </div>
      <slot name="details" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { FolderIcon } from '@/assets/icons/V1'
import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import DatasetItemName from '@/components/DatasetManagement/Common/DatasetItemName.vue'
import FramesOverlayIcon from '@/components/DatasetManagement/assets/frames-listitem-overlay.svg?inline'
import VideoOverlayIcon from '@/components/DatasetManagement/assets/video-listitem-overlay.svg?inline'
import { formatDate } from '@/utils'

/**
 * Defines layout and look for all list item components.
 *
 * Renders date, image and name for all of them.
 * Provides slots for status and details.
 */
@Component({
  name: 'list-item',
  components: { CheckBox, DatasetItemName, FolderIcon, FramesOverlayIcon, VideoOverlayIcon }
})
export default class ListItem extends Vue {
  @Prop({ required: true, type: String })
  name!: string

  @Prop({ type: String, default: null })
  date!: string | null

  @Prop({ type: String, default: null })
  thumbnail!: string

  @Prop({ default: 'image' })
  type!: 'folder' | 'image' | 'video' | 'video-frames'

  @Prop({ default: false, type: Boolean })
  isSelected!: boolean

  get formattedDate (): string {
    return this.date ? formatDate(this.date, 'DD/MM/YY') : ''
  }

  get isFolder () {
    return this.type === 'folder'
  }

  get isVideo () {
    return this.type === 'video'
  }

  get isVideoFrames () {
    return this.type === 'video-frames'
  }

  onSelect (evt: MouseEvent) {
    this.$emit('select', evt, !this.isSelected)
  }
}
</script>

<style lang="scss" scoped>
.list-item {
  @include row--center;
  width: 100%;
  height: 35px;
  min-height: 35px;
  background: transparent;
  padding: 2px 0 2px 10px;
  border-radius: $border-radius-default;
  border: 1px solid transparent;
  cursor: pointer;

  &:hover {
    background: $colorAliceShade;
  }
}

.list-item__checkbox {
  @include noSelect;
}

.list-item--selected {
  background: $colorAliceShade;
  border-color: $colorAliceNight;
}

.list-item__content {
  flex: 1;
  @include row--center;
  @include typography(md, default);
  color: $colorSecondaryDark1;
  border-radius: $border-radius-default;
  height: 35px;
  padding-right: 10px;
  overflow: hidden;
}

.list-item__thumbnail {
  @include noSelect;
  @include row--center;
  height: 33px;
  border-radius: $border-radius-default;
  overflow: hidden;
  position: relative;

  &:hover {
    .list-item__overlay {
      display: flex;
    }
  }
}

.list-item__thumbnail__folder {
  width: 20px;
  color: $colorAliceNight;
}

.list-item__thumbnail__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  overflow: hidden;
}

.list-item__thumbnail__video_overlay {
  position: absolute;
  top: 2px;
  bottom: 52px;
  height: calc(100% - 4px);
}

.list-item__overlay {
  position: absolute;
  @include fullsize;
  overflow: hidden;
  display: none;

  &:hover {
    background: rgba(145, 169, 192, .5);
    @include row--center;
  }
}

.list-item__name {
  @include ellipsis(1, md);
}

.list-item__status {
  @include row;
  align-items: center;
}

.list-item__status > :first-child {
  margin-right: 5px;
}

.list-item__date {
  text-align: right;
}
</style>
