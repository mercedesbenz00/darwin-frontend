<template>
  <div class="tag-applier__input">
    <input-field
      ref="inputField"
      class="input-field"
      id="TagApplierInput"
      :value="keyword"
      :items="items"
      :disabled="disabled"
      placeholder="Type to search or add a tag"
      color="transparent"
      multiple
      wrap
      @change="onChange"
      @change:multiple="onChangeMultiple"
      @delete="onDelete"
      @keydown="onKeydown"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref, Ref, SetupContext } from 'vue'

import { BadgeType } from '@/components/Common/Badge'
import { InputField } from '@/components/Common/InputField/V2'
import { useFocus, useHotkeysNavigation } from '@/composables'

export default defineComponent({
  name: 'TagApplierInput',
  components: { InputField },
  props: {
    keyword: { type: String, required: true },
    items: { type: Array as PropType<BadgeType[]>, required: true },
    disabled: { type: Boolean, default: false }
  },
  setup (props, { emit }: SetupContext) {
    const focused: Ref<boolean> = ref(false)

    const itemsLength = computed((): number => {
      return props.items ? props.items.length : 0
    })

    useFocus('tag-applier__input', (value: boolean) => {
      focused.value = value
    })

    useFocus('input-field', (value: boolean) => {
      focused.value = value
    })

    const onChange = (value: string): void => {
      emit('change', value)
    }

    const onChangeMultiple = (): void => {
      if (focused.value) { emit('create', props.keyword) }
    }

    const onDelete = (id: string): void => {
      emit('delete', id)
    }

    const onKeydown = (params: { event: Event, value: string }): void => {
      const { value } = params
      emit('keydown', value)
    }

    useHotkeysNavigation({
      name: 'tag applier input',
      condition: focused,
      handlers: {
        increase: () => emit('focus:list'),
        decrease: () => emit('focus:list'),
        submit: () => {
          emit('create', props.keyword)
        }
      }
    })

    return {
      focused,
      itemsLength,
      onChange,
      onChangeMultiple,
      onDelete,
      onKeydown
    }
  }
})
</script>

<style lang="scss" scoped>
.tag-applier__input {
  position: relative;
  display: flex;
  height: auto;
  min-height: 49px;
  max-height: 50%;
  padding: 4px;
  width: 100%;
  border-top: 1px solid $colorBorderLight;
  overflow: visible;
  @include scrollbarV2;

  &:focus,
  &:active {
    outline: none;
  }

  :deep(.inputfield__container) {
    min-height: 100%;

    &:focus,
    &:active {
      outline: none;
    }

    .inputfield__container--wrap {
      max-height: 100%;
    }

    .inputfield--multiple {
      min-width: 32px;
    }
  }
}
</style>
