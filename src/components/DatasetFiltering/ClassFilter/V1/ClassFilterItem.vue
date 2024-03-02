<template>
  <div
    class="class-filter-item"
    :class="{
      [`class-filter-item--${status}`]: true,
      'class-filter-item--taggable': taggable,
      'class-filter-item--no-action': actionHide
    }"
    @click="onClick"
  >
    <div class="class-filter-item__details">
      <type-icon
        v-if="classIconName"
        class="class-filter-item__icon"
        :type="classIconName"
        :color="classIconColor"
      />
      <span class="class-filter-item__label">{{ data.label }}</span>
    </div>
    <div
      v-if="taggable && !actionHide"
      class="class-filter-item__actions"
    >
      <div
        v-tooltip="tagButtonTooltip"
        class="class-filter-item__action"
        :class="{ 'class-filter-item__action--disabled': actionDisabled }"
      >
        <positive-button
          class="class-filter-item__tag"
          :disabled="actionDisabled"
          @click.prevent.stop="onTagClick"
        >
          Apply Tag
        </positive-button>
      </div>
      <div
        v-tooltip="untagButtonTooltip"
        class="class-filter-item__action"
        :class="{ 'class-filter-item__action--disabled': actionDisabled }"
      >
        <secondary-button
          class="class-filter-item__untag"
          :disabled="actionDisabled"
          @click.prevent.stop="onUntagClick"
        >
          &#10005;
        </secondary-button>
      </div>
    </div>
    <span class="class-filter-item__count">{{ count }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'
import { AnnotationClassPayload, AnnotationTypePayload } from '@/store/types'
import { TriToggleStatus } from '@/utils'

import { ClassFilterItemType } from './types'

@Component({ name: 'class-filter-item', components: { TypeIcon } })
export default class ClassFilterItem extends Vue {
  @Prop({ required: true })
  data!: ClassFilterItemType

  @Prop({
    type: String as () => TriToggleStatus,
    default: 'none'
  })
  status!: TriToggleStatus

  @Prop({ type: Boolean, default: false })
  actionDisabled!: boolean

  @Prop({ type: Boolean, default: false })
  actionHide!: boolean

  get count () {
    return this.data && typeof this.data.count === 'number' ? this.data.count : ''
  }

  @Getter('mainAnnotationTypeForClass', { namespace: 'aclass' })
  getMainAnnotationType!: (data: AnnotationClassPayload) => AnnotationTypePayload

  get classIconName (): string | null {
    const { data } = this
    if (!data || !data.aclass) { return null }

    return this.getMainAnnotationType(data.aclass).name
  }

  get classIconColor (): string | null {
    const { data } = this
    if (!data || !data.aclass) { return null }
    return data.aclass.metadata._color
  }

  get taggable (): boolean {
    const { data } = this
    if (!data || !data.aclass) { return false }

    return data.aclass.annotation_types.includes('tag')
  }

  get tagButtonTooltip () {
    return this.actionDisabled
      ? { content: 'No images are selected', placement: 'top' }
      : undefined
  }

  get untagButtonTooltip () {
    return {
      content: this.actionDisabled ? 'No images are selected' : 'Untag',
      placement: 'top'
    }
  }

  onClick (evt: MouseEvent) {
    if (evt.shiftKey) {
      this.$emit('shift-click', this.data)
    } else {
      this.$emit('click', this.data)
    }
  }

  onTagClick () {
    if (this.actionDisabled) { return }
    this.$emit('tag', this.data)
  }

  onUntagClick () {
    if (this.actionDisabled) { return }
    this.$emit('untag', this.data)
  }
}
</script>

<style lang="scss" scoped>
.class-filter-item {
  @include row--distributed--center;
  @include noSelect;
  width: 100%;
  border-radius: 13px;
  padding: 0 10px 0 5px;
  min-height: 25px;
  transition: background-color .2s;
  cursor: pointer;

  &:hover, &:active {
    border: 1px solid $colorAliceShade;
    background-color: $colorAliceShade;
    transition: none;
  }
}

.class-filter-item--none {
  border: 1px solid $colorAliceBlue;
  background-color: transparent;

  &:hover, &:active {
    border: 1px solid $colorAliceShade;
    background-color: $colorAliceShade;
  }
}

.class-filter-item--positive {
  border: 1px solid $colorAliceNight;
  background-color: $colorAliceShadow;

  &:hover, &:active {
    border: 1px solid $colorAliceNight;
    background-color: $colorAliceShadow;
  }
}

.class-filter-item--negative {
  border: 1px solid $colorCrimson;
  background-color: $colorCrimsonDawn;

  &:hover, &:active {
    border: 1px solid $colorCrimson;
    background-color: $colorCrimsonDawn;
  }
}

.class-filter-item--taggable:not(.class-filter-item--no-action) {
  &:hover, &:active {
    .class-filter-item__count {
      display: none;
    }
  }
}

.class-filter-item--taggable {
  &:hover, &:active {
    .class-filter-item__actions {
      display: flex;
    }
  }
}
.class-filter-item__details {
  @include row--center;
  overflow: hidden;
}
.class-filter-item__icon {
  width: 23px;
  height: 23px;
  min-width: 23px;
  min-height: 23px;
  margin-right: 3px;
}
.class-filter-item__label {
  flex: 1 1 auto;
  @include typography(md);
  text-align: left;
  color: $colorSecondaryDark1;
  padding: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.class-filter-item__count {
  margin-right: 5px;
  @include typography(sm, default, bold);
  text-align: right;
  color: $colorSecondaryLight;
}
.class-filter-item__actions {
  @include row;
  display: none;
}
.class-filter-item__action {
  @include row--center;
}

.class-filter-item__tag,
.class-filter-item__untag {
  @include typography(sm, mulish, bold);
  height: 20px;
  border-radius: $border-radius-default;
  white-space: nowrap;
}

.class-filter-item__tag {
  margin-right: 4px;
  padding: 2px 4px;
}

.class-filter-item__untag {
  padding: 1px 5px;
  border-color: $colorAliceNight;
  color: $colorAliceNight;

  &:hover {
    background-color: rgba($colorAliceNight, 0.3);
  }

  &:active {
    background: rgba($colorAliceNight, 0.2);
  }
}
</style>
