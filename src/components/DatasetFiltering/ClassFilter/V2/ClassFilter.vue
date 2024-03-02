<template>
  <div class="class-filter">
    <div
      class="class-filter__container"
      :class="{ 'class-filter__container--list-only': listOnly }"
    >
      <input-field
        class="class-filter__input-v2"
        :value="tagKeyword"
        @change="setTagKeyword"
        @enter="onEnter"
        :placeholder="placeholder"
      />
      <div
        class="class-filter__list"
      >
        <class-filter-item
          v-for="item of sortedOptions"
          :key="`filter-item-${item.id}`"
          :action-disabled="disabled"
          :disabled-action-tooltip="disabledActionTooltip"
          :action-hide="listOnly"
          :data="item"
          :status="optionMap[item.id]"
          @click="onItemClick"
          @shift-click="onItemShiftClick"
          @tag="onTag"
          @untag="onUntag"
        />
      </div>
    </div>
    <!-- Replace with multi-select when implemented -->
    <div
      v-if="!listOnly"
      class="class-filter__submit"
    >
      <custom-button
        class="class-filter__create-tag"
        color="transparent"
        size="small"
        :disabled="newTagDisabled"
        flair="rounded"
        @click="onCreateTag"
      >
        Create {{ newTagDisabled ? 'a tag' : '' }}
        <badge
          v-if="!newTagDisabled"
          class="class-filter__submit__button__badge"
          :label="tagKeyword"
          :color="primaryColor"
          size="medium"
          no-capitalize
        />
      </custom-button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  PropType,
  SetupContext,
  computed
} from 'vue'

import { Badge } from '@/components/Common/Badge'
import { CustomButton } from '@/components/Common/Button/V2'
import { InputField } from '@/components/Common/InputField/V2'
import { resolveNextTriToggleStatus, TriToggleStatus, primary } from '@/utils'

import ClassFilterItem from './ClassFilterItem.vue'
import { ClassFilterItemType, ClassFilterProps } from './types'
import { useClassFilterOptions } from './useClassFilterOptions'

export default defineComponent({
  name: 'ClassFilter',
  components: { InputField, CustomButton, ClassFilterItem, Badge },
  props: {
    options: {
      required: true,
      type: Array as PropType<ClassFilterItemType[]>
    },
    positiveOptions: {
      required: true,
      type: Array as PropType<number[]>
    },
    negativeOptions: {
      required: true,
      type: Array as PropType<number[]>
    },
    disabled: {
      required: false,
      type: Boolean,
      default: false
    },
    disabledActionTooltip: {
      required: false,
      type: String,
      default: ''
    },
    listOnly: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  setup (props: ClassFilterProps, context: SetupContext) {
    const tagKeyword = ref('')
    const primaryColor = primary()
    const {
      newTagDisabled, optionMap, sortedOptions,
      emitCurrent, clearFilter, updateOptionMap
    } = useClassFilterOptions(props, context, tagKeyword)

    const setTagKeyword = (val: string): void => {
      tagKeyword.value = val
    }

    const onCreateTag = (): void => {
      if (!newTagDisabled.value) {
        context.emit('create-tag', tagKeyword.value.trim())
      }
    }

    const resetTagInput = (): void => {
      tagKeyword.value = ''
    }

    const onItemClick = (item: ClassFilterItemType): void => {
      optionMap.value[item.id] = resolveNextTriToggleStatus(optionMap.value[item.id])
      updateOptionMap(optionMap.value)

      emitCurrent()
    }

    const onItemShiftClick = (item: ClassFilterItemType): void => {
      optionMap.value = props.options.reduce((nextOptionsMap, option) => {
        nextOptionsMap[option.id] = option.id === item.id
          ? resolveNextTriToggleStatus(optionMap.value[item.id])
          : 'none'
        return nextOptionsMap
      }, {} as { [id: string]: TriToggleStatus })

      updateOptionMap(optionMap.value)

      emitCurrent()
    }

    const onTag = (item: ClassFilterItemType): void => {
      context.emit('tag', item)
    }

    const onUntag = (item: ClassFilterItemType): void => {
      context.emit('untag', item)
    }

    const onEnter = (): void => {
      if (props.listOnly) { return }
      onCreateTag()
    }

    const placeholder = computed(() =>
      props.listOnly ? 'Filter by class' : 'Type to tag or filter by class'
    )

    return {
      tagKeyword,
      sortedOptions,
      optionMap,
      newTagDisabled,
      primaryColor,
      clearFilter,
      setTagKeyword,
      onCreateTag,
      resetTagInput,
      onItemClick,
      onItemShiftClick,
      onTag,
      onUntag,
      onEnter,
      placeholder
    }
  }
})
</script>

<style lang="scss" scoped>
.class-filter {
  position: relative;
  @include col;
  background: $colorNeutralsLightWhite;

  &__container {
    @include col--center;
    width: 100%;
    height: 100%;
    padding-bottom: 45px;
    overflow: hidden;
    gap: 8px;

    &--list-only {
      padding-bottom: 0;
    }
  }
}

.class-filter__input-v2 {
  width: 100%;

  :deep(.inputfield) {
    font-size: 13px;
  }
}

.class-filter__list {
  @include col;
  flex: 1;
  align-items: center;
  width: 100%;
  margin-bottom: 5px;
  overflow-y: scroll;
  @include scrollbarV2;

  & > div {
    margin: 1px 0;
  }
}

.class-filter__submit {
  position: absolute;
  @include row--center;
  align-items: center;
  width: 100%;
  padding-top: 8px;
  bottom: 0;
  border-top: 1px solid $colorBorderLight;

  &__button__badge {
    max-width: 160px !important;

    &:deep(.badge__content__label) {
      @include ellipsis(1, md);
      font-weight: 700;
    }
  }

  &:deep(.custom-button__label) {
    @include row--center;
    align-items: center;
    gap: 4px;
    color: $colorInteractivePrimaryDefault;

    &:disabled {
      color: $colorInteractivePrimaryDisabled;
    }

    &:hover {
      color: $colorInteractivePrimaryHover;
    }

    &:active,
    &:focus {
      color: $colorInteractivePrimaryPressed;
    }
  }
}

</style>
