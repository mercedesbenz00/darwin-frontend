<template>
  <component
    :is="tag"
    class="dataset-card"
    :class="{ 'dataset-card--selected': selected }"
    :to="route"
    @click.stop="$emit('click')"
    @dblclick.stop="$emit('dblclick')"
  >
    <div class="dataset-card__upside">
      <div class="dataset-card__upside__row dataset-card__upside__row--top">
        <div class="dataset-card__img">
          <img
            v-if="thumbnails[0]"
            v-lazy="thumbnails[0]"
          >
        </div>
        <div class="dataset-card__img">
          <img
            v-if="thumbnails[1]"
            v-lazy="thumbnails[1]"
          >
        </div>
        <div class="dataset-card__img">
          <img
            v-if="thumbnails[2]"
            v-lazy="thumbnails[2]"
          >
        </div>
      </div>
      <div class="dataset-card__upside__row">
        <div class="dataset-card__img">
          <img
            v-if="thumbnails[3]"
            v-lazy="thumbnails[3]"
          >
        </div>
        <div class="dataset-card__img">
          <img
            v-if="thumbnails[4]"
            v-lazy="thumbnails[4]"
          >
        </div>
        <div class="dataset-card__img">
          <img
            v-if="thumbnails[5]"
            v-lazy="thumbnails[5]"
          >
        </div>
      </div>

      <transition
        v-if="!disableMenu"
        name="fade"
      >
        <div class="dataset-card__overlay">
          <div
            class="dataset-card__overlay__more"
            @click.stop.prevent="toggleMenu"
          >
            <img
              src="/static/imgs/more-white-icon.svg"
              class="dataset-card__overlay__more__img"
            >
          </div>
        </div>
      </transition>
      <div
        v-if="menu"
        v-click-outside="hideMenu"
        class="dataset-card__menu"
        :class="{'dataset-card__menu--right': menuAlign === 'right'}"
      >
        <div
          v-if="$can('archive_dataset', { subject: 'dataset', resource: data })"
          class="dataset-card__menu__item"
          @click.stop.prevent="onDelete"
        >
          Delete
        </div>
        <div
          v-else
          class="dataset-card__menu__item dataset-card__menu__item--disabled"
          @click.stop.prevent="notifyCannotDelete"
        >
          Delete
        </div>
      </div>
      <div
        v-if="data.public"
        class="dataset-card__status"
      >
        <img
          src="/static/imgs/dataset-status-open.svg"
          class="dataset-card__status-icon"
        >
        <div class="dataset-card__status-text">
          Open
        </div>
      </div>
    </div>
    <div class="dataset-card__downside">
      <div class="dataset-card__name">
        {{ data.name }}
      </div>
      <div class="dataset-card__stats">
        <div>
          <strong>{{ data.num_images + data.num_videos }}</strong> Files
        </div>
        <div>
          <strong>{{ data.num_classes }}</strong> Classes
        </div>
        <div>
          <strong>{{ progressPercentage }}%</strong> Complete
        </div>
      </div>
    </div>
    <div
      v-tooltip="{
        content: progressTooltip,
        placement: 'top',
        delay: { show: 300 },
        classes: 'tooltip--dataset-card'
      }"
      class="dataset-card__progress__bar"
    >
      <div
        class="dataset-card__progress__bar__filled"
        :style="{ width: progressPercentage + '%' }"
      />
    </div>
  </component>
</template>

<script lang = "ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import { DatasetPayload } from '@/store/types'
import { notifyErrorByCode } from '@/utils'

@Component({ name: 'dataset-card', components: { CheckBox } })
export default class DatasetCard extends Vue {
  @Prop({ required: true })
  data!: DatasetPayload

  @Prop({ default: 'normal' })
  menuAlign!: string

  @Prop({ default: false, type: Boolean })
  disableMenu!: boolean

  @Prop({ default: false, type: Boolean })
  selectable!: boolean

  @Prop({ default: false, type: Boolean })
  selected!: boolean

  menu: boolean = false

  get tag (): 'router-link' | 'div' {
    if (this.selectable) { return 'div' }
    return 'router-link'
  }

  get progressPercentage (): number {
    return Math.round((this.data.progress || 0) * 100)
  }

  get route (): string {
    if (this.data.version === 1) {
      return `/datasets/${this.data.id}/dataset-management`
    } else {
      return `/datasets/${this.data.id}/dataset-management?not_statuses=archived`
    }
  }

  get progressTooltip (): string {
    const { num_images: images, num_videos: videos, num_classes: classes } = this.data
    if (!images || !videos) { return '' }
    return `${images + videos} Files, ${classes} Classes, ${this.progressPercentage}% Complete`
  }

  get thumbnails (): string[] {
    return this.data.thumbnails ? this.data.thumbnails : []
  }

  toggleMenu (): void {
    this.menu = !this.menu
  }

  hideMenu (): void {
    this.menu = false
  }

  onDelete (): void {
    this.hideMenu()
    this.$emit('delete', this.data)
  }

  /**
   * "Delete" option in the dataset card dropdown is clickable
   * even when the user is not allowed to delete the dataset
   * and the appearance is that of a disabled control, but
   * instead of performing a backend request, it just notifies
   * why the user cannot delete the dataset.
   */
  notifyCannotDelete (): void {
    this.hideMenu()
    notifyErrorByCode(this.$store, 'DATASET_DELETE_NOT_AUTHORIZED')
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tooltip--dataset-card {
  &[x-placement^="top"] {
    margin-bottom: 7px;
  }
}
</style>

<style lang="scss" scoped>
.dataset-card {
  @include col;
  display: inline-flex;
  height: 270px;
  border-radius: 7px;
  border: 3px solid transparent;
  position: relative;
  cursor: pointer;

  &:hover {
    .dataset-card__overlay {
      display: flex;
    }
  }

  &:not(:hover) {
    .dataset-card__overlay {
      display: none;
    }
  }

  .dataset-card--selected {
    .dataset-card__overlay {
      display: flex;
    }
  }
}

.dataset-card--selected {
  border-color: $colorFeatherLight;
}

.dataset-card__upside {
  width: 100%;
  height: 180px;
  border-radius: 5px 5px 0 0;
  position: relative;
}

.dataset-card__upside__row {
  width: 100%;
  height: 50%;
  @include row--center;
}

.dataset-card__upside__row--top {
  border-radius: 5px 5px 0 0;
  overflow: hidden;
}

.dataset-card__img {
  flex: 1 1 auto;
  height: 100%;
  background: #FAFCFE;
}

.dataset-card__overlay {
  position: absolute;
  @include fullsize;
  border-radius: 5px 5px 0 0;
  padding-bottom: 40px;
  padding: 0;
  z-index: 800;
  @include row--center;
}

.dataset-card__overlay__back {
  position: absolute;
  @include fullsize;
  background: linear-gradient(118.32deg, #2C4573 0%, #0B2448 83.62%);
  mix-blend-mode: darken;
  border-radius: 5px 5px 0 0;
  opacity: 0.7;
}

.dataset-card__overlay__select {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: transparent;
}

.dataset-card__overlay__open {
  width: 40%;
  height: 40px;
  @include row--center;
  background: transparent;
  border: 2px solid $colorWhite;
  border-radius: 5px;
  @include typography(md-1, headlines, 500);
  color: $colorWhite;
  text-align: center;
  letter-spacing: 0.5px;
  opacity: 1;
  cursor: pointer;
  z-index: 999;
  transition: background-color 200ms linear, color 200ms linear;
  @include noSelect;

  &:hover, &:active {
    background: $colorWhite;
    color: $colorSecondaryDark1;
  }
}

.dataset-card__overlay__more {
  position: absolute;
  top: 5px;
  right: 10px;
  width: 32px;
  padding: 10px 0;
  @include row--center;
  @include noSelect;

  &:active {
    opacity: 0.8;
  }
}

.dataset-card__overlay__more__img {
  width: 32px;
  height: 9px;
  object-fit: contain;
}

.dataset-card__menu {
  position: absolute;
  top: 30px;
  right: -60px;
  width: 150px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 20px 60px rgba(11, 36, 72, 0.2), 0px 1px 2px rgba(58, 78, 108, 0.05);
  @include col;
  z-index: 1000;
}

.dataset-card__menu--right {
  right: 5px;
}

.dataset-card__menu__item {
  flex: 1;
  padding: 11px 16px;
  @include typography(md, default);
  line-height: 18px;
  background: $colorWhite;
  color: $colorSecondaryLight;

  cursor: pointer;

  &:not(.dataset-card__menu__item--disabled):hover {
    font-weight: bold;
    color: $colorSecondaryDark1;
    background: $colorGriteDark2;
  }

  &.dataset-card__menu__item--disabled {
    cursor: auto;
    color: $colorSecondaryLight1;
  }
}

.dataset-card__menu__item--gray {
  background: $colorGriteDark;
}

.dataset-card__status {
  position: absolute;
  left: 0; bottom: 0;
  @include row--center;
  background: $colorAliceShade;
  border-radius: 0 2px 0 0;
  width: 90px;
  height: 28px;
  z-index: 999;
}

.dataset-card__status-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}
.dataset-card__status-text {
  margin-left: 10px;
  @include typography(md-1, headlines, bold);
  color: $colorAliceNight;
}

.dataset-card__downside {
  flex: 1;
  background: $colorAliceShade;
  padding: 12px 20px 12px 20px;
  position: relative;
  overflow: hidden;
}

.dataset-card__name {
  @include ellipsis(2, lg, 22px);
  @include typography(md-1, default, bold);
  word-break: break-all;
  min-height: 36px;
  text-decoration: none;
  color: $colorSecondaryDark;
  margin: 0;
}

.dataset-card__stats {
  @include row--distributed;
  @include typography(md, default);
  line-height: 20px;

  /* Graple Light 2 */
  color: $colorSecondaryLight;

  strong {
    font-weight: bold;
    color: $colorSecondaryDark;
  }
}

.dataset-card__progress__bar {
  width: 100%;
  height: 6px;
  position: relative;
  background: $colorSecondaryLight2;
  border-radius: 0 0 5px 5px;
  overflow: hidden;
}

.dataset-card__progress__bar__filled {
  position: absolute;
  bottom: 0;
  height: 6px;
  background: $colorPrimaryLight1;
  border-radius: 0 0 0 5px;
}
</style>
