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
        @click="onTagClickPreProcess"
      >
        <custom-button
          class="class-filter-item__tag"
          color="primary"
          :disabled="actionDisabled"
          size="very-small"
          flair="rounded"
          @click.prevent.stop="onTagClick"
        >
          Apply Tag
        </custom-button>
      </div>
      <div
        v-tooltip="untagButtonTooltip"
        class="class-filter-item__action"
        :class="{ 'class-filter-item__action--disabled': actionDisabled }"
        @click="onTagClickPreProcess"
      >
        <icon-button
          class="class-filter-item__untag"
          size="mini"
          flair="rounded"
          :disabled="actionDisabled"
          @click.prevent.stop="onUntagClick"
        >
          &#10005;
        </icon-button>
      </div>
    </div>
    <span class="class-filter-item__count">{{ count }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'
import { CustomButton, IconButton } from '@/components/Common/Button/V2'
import { AnnotationClassPayload, AnnotationTypePayload } from '@/store/types'
import { TriToggleStatus } from '@/utils'

import { ClassFilterItemType } from './types'

@Component({
  name: 'class-filter-item',
  components: {
    CustomButton,
    IconButton,
    TypeIcon
  }
})
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

  @Prop({ type: String, default: '' })
  disabledActionTooltip!: string

  get count (): number | string {
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
      ? { content: this.disabledActionTooltip, placement: 'top' }
      : undefined
  }

  get untagButtonTooltip () {
    return {
      content: this.actionDisabled ? this.disabledActionTooltip : 'Untag',
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

  onTagClickPreProcess (evt: MouseEvent) {
    if (this.actionDisabled) {
      evt.preventDefault()
      evt.stopPropagation()
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
  border-radius: 8px;
  padding: 0 6px 0 6px;
  min-height: 30px;
  transition: background-color .2s;
  cursor: pointer;

  &:hover, &:active {
    background-color: $colorWhite;
    transition: none;
  }
}

.class-filter-item--none {
  background-color: $colorWhite;

  &:hover, &:active {
    background-color: $colorOverlayHover;
  }
}

.class-filter-item--positive {
  background-color: $colorOverlayInteractive;

  &:hover, &:active {
    background-color: $colorOverlayInteractive;
  }
}

.class-filter-item--negative {
  background-color: $colorSolidNegative;

  &:hover, &:active {
    background-color: $colorSolidNegative;
  }

  .class-filter-item__label {
    text-decoration: line-through;
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
  @include typography(md, inter, 500);
  text-align: left;
  color: $colorContentDefault;
  padding: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.class-filter-item__count {
  @include typography(md, inter, 500);
  text-align: right;
  color: $colorContentTertiary;
}
.class-filter-item__actions {
  @include row;
  flex-shrink: 0;
  display: none;
}
.class-filter-item__action {
  @include row--center;
}

.class-filter-item__tag {
  margin-right: 4px;
  padding: 2px 4px;
  @include typography(md, inter, 500);
}

.class-filter-item__untag {
  padding: 1px 5px;
}
</style>
