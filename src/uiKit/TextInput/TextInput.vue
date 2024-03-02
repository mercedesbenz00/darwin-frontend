<template>
  <component
    class="text-input"
    :is="tag"
    tabindex="1"
    :v-bind="$attrs"
    :v-on="$listeners"
  >
    <div
      class="text-input__label"
    >
      {{ label }}
      <span
        v-if="optional"
        class="text-input__label--optional"
      >
        (optional)
      </span>
    </div>
    <div
      class="text-input__container"
      :class="{
        focused: focus,
        disabled: disabled,
        error: !!hasError,
        warning: !!hasWarning,
        'text-input__container--wrap': shouldWrap
      }"
    >
      <div
        v-if="$slots['left-icon']"
        class="text-input__container__icon text-input__container__icon--left"
        @click="input.focus()"
      >
        <slot name="left-icon" />
      </div>
      <div
        v-if="multiple"
        class="text-input__container__items"
      >
        <badge
          v-for="({ id, label, color }) in (items || [])"
          :key="id"
          :label="label"
          :color="color"
          size="medium"
          deletable
          wrap
          no-capitalize
          @delete="$emit('delete', id)"
        />
        <input
          :id="id"
          class="text-input__container__input text-input__container__input--multiple"
          :class="{ 'text-input--multiple--wrap': shouldWrap}"
          :placeholder="placeholder"
          v-bind="$props"
          v-model="inputText"
          ref="input"
          @focus="onFocus"
          @blur="onBlur"
          @keypress="isNumber($event)"
          @keydown.enter.stop="onEnter"
          @keydown.esc.stop="onEscape"
        >
      </div>
      <input
        v-else
        :id="id"
        class="text-input__container__input"
        :placeholder="placeholder"
        v-bind="$props"
        v-model="inputText"
        ref="input"
        @change="onFocus"
        @focus="onFocus"
        @blur="onBlur"
        @keypress="isNumber($event)"
        @keydown.enter.stop="onEnter"
        @keydown.esc.stop="onEscape"
      >
      <div
        v-if="hasError"
        class="text-input__container__icon text-input__container__icon--error"
      >
        <icon-duotone-warn />
      </div>
      <div
        class="text-input__container__icon text-input__container__icon--right"
        v-if="$slots['right-icon']"
      >
        <slot name="right-icon" />
      </div>
      <div
        class="text-input__container__icon text-input__container__icon--hotkey"
        v-if="$slots['right-icon']"
      >
        <slot name="hotkey" />
      </div>
    </div>
    <div
      v-if="error"
      class="text-input__label text-input__label--error"
    >
      {{ error }}
    </div>
    <div
      v-if="warning"
      class="text-input__label text-input__label--warning"
    >
      {{ warning }}
    </div>
    <div
      v-if="info"
      class="text-input__label text-input__label--info"
    >
      {{ info }}
    </div>
  </component>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'

import { IconDuotoneWarn } from '@/assets/icons/V2/Duotone'
import { Badge } from '@/components/Common/Badge'

import { TextInputProps } from './types'

/**
 * Generic input field component to be used across the board.
 *
 * Wraps an input element with a couple of extra elements and slots, to support
 * giving it extra content on the left and right side, an error, info or warning message, etc.
 */
export default defineComponent({
  name: 'TextInput',
  components: { IconDuotoneWarn, Badge },
  props: {
    /**
     * The actual value of the input element.
     * Emits a change event when it changes, so it can be used with v-model.
     */
    value: {
      required: true,
      type: String as () => TextInputProps['value']
    },
    /**
     * Optional tag attribute which is bound to the input element
     */
    tag: {
      required: false,
      default: 'div',
      type: String as () => TextInputProps['tag']
    },
    /**
     * Optional id attribute which is bound to the input element
     */
    id: {
      required: false,
      default: null,
      type: String as () => TextInputProps['id']
    },
    /**
     * Optional label attribute for the input element
     */
    label: {
      required: false,
      default: null,
      type: String as () => TextInputProps['label']
    },
    /**
     * Optional placeholder attribute for the input element
     */
    placeholder: {
      required: false,
      default: null,
      type: String as () => TextInputProps['placeholder']
    },
    /**
     * For numeric inputs, optional value for the `min` attribute
     */
    min: {
      required: false,
      default: null,
      type: Number as () => TextInputProps['min']
    },
    /**
     * For numeric inputs, optional value for the `max` attribute
     */
    max: {
      required: false,
      default: null,
      type: Number as () => TextInputProps['max']
    },
    /**
     * Binds to the `required` attribute of the input field.
     */
    required: {
      required: false,
      default: false,
      type: Boolean as () => TextInputProps['required']
    },
    /**
     * Shows an optional text after the label.
     */
    optional: {
      required: false,
      default: false,
      type: Boolean as () => TextInputProps['optional']
    },
    /**
     * For mainly text inputs, optional value for the html `max-length` attribute
     */
    maxLength: {
      required: false,
      default: null,
      type: Number as () => TextInputProps['maxLength']
    },
    /**
     * Optional value for the type attribute of the input element.
     * Defaults to 'text'.
     */
    type: {
      required: false,
      default: 'text',
      type: String as () => TextInputProps['type']
    },
    /**
     * Binds to the 'disabled' html attribute of the input element
     */
    disabled: {
      required: false,
      default: false,
      type: Boolean as () => TextInputProps['disabled']
    },
    /**
     * Optional value for the error message, rendered below the input field.
     */
    error: {
      required: false,
      default: null,
      type: String as () => TextInputProps['error']
    },
    /**
     * Optional value for the info message, rendered below the input field.
     */
    info: {
      required: false,
      default: null,
      type: String as () => TextInputProps['info']
    },
    /**
     * Optional value for the warning message, rendered below the input field.
     */
    warning: {
      required: false,
      default: null,
      type: String as () => TextInputProps['warning']
    },
    /**
     * Focuses the input element automatically on mount if true.
     * With multiple autofocus components on the same page, the last one mounted wins.
     */
    autofocus: {
      required: false,
      default: false,
      type: Boolean as () => TextInputProps['autofocus']
    },
    /**
     * Keep an array of values rendered as badges
     */
    items: {
      required: false,
      default: () => [],
      type: Array as () => TextInputProps['items']
    },
    /**
     * Keep an array of values rendered as badges
     */
    multiple: {
      required: false,
      default: false,
      type: Boolean as () => TextInputProps['multiple']
    },
    /**
     * used togheter with multiple its height adapt to
     * the contained items
     */
    wrap: {
      required: false,
      default: false,
      type: Boolean as () => TextInputProps['wrap']
    },
    /**
     * Text input but allows only numbers as input
     */
    largeNumber: {
      required: false,
      default: false,
      type: Boolean as () => TextInputProps['largeNumber']
    }
  },
  setup (props, { emit }) {
    /**
     * Holds element reference to the input field.
     * We use it in the mounted hook to achieve autofocus behavior.
     */
    const input = ref<HTMLInputElement | null>(null)

    // toggles between true/false on input field focus/blur
    const focus = ref(false)

    /**
     * Check if input should wrap
     */
    const shouldWrap = computed((): boolean => {
      return !!props.multiple && !!props.wrap && (props.items || []).length > 0
    })

    /**
     * Delegates the value prop on get, but emits events on set,
     * to support v-model and syncing with errors/warnings
     */
    const inputText = computed({
      get: () => props.value,
      set: (val) => {
        // clear error
        if (props.error) { emit('update:error', null) }
        // clear warning
        if (props.warning) { emit('update:warning', null) }
        emit('input', val)
        emit('change', val)
      }
    })

    /**
     * Delegates the items prop on get, but emits events on set,
     * to support v-model and syncing with errors/warnings
     */
    const inputItems = computed({
      get: () => props.items,
      set: (val) => emit('change:multiple', val)
    })

    /**
     * Boolean returning true if the error prop is set.
     * Means the error will be rendered.
     */
    const hasError = computed(() => !!props.error)

    /**
     * Boolean returning true if the warning prop is set.
     * Means the warning will be rendered.
     */
    const hasWarning = computed(() => !!props.warning)

    /**
     * Event handler called when the input element receives focus
     */
    const onFocus = (): void => {
      focus.value = true
      emit('focus')
    }

    /**
     * Event handler called when the blur element is blurred
     */
    const onBlur = (): void => {
      focus.value = false
      emit('blur')
    }

    /**
     * Event handler called when the enter key event is received by the input field,
     * meaning user pressed enter while the input was focused.
     */
    const onEnter = (event: KeyboardEvent): void => {
      if (props.multiple) {
        inputItems.value = [
          ...(inputItems.value || []),
          { label: `${inputText.value}` }
        ]
        inputText.value = ''
      }
      emit('enter', { event, value: `${input.value?.value}` })
    }

    const onEscape = (e: KeyboardEvent): void => {
      emit('escape', e)
    }

    const isNumber = (evt: KeyboardEvent): boolean | void => {
      if (!props.largeNumber) { return true }
      evt = evt || window.event
      const charCode = evt.which ? evt.which : evt.keyCode
      if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
        evt.preventDefault()
      } else {
        return true
      }
    }

    const setFocus = (): void => {
      if (input.value) { input.value.focus() }
    }

    onMounted(() => {
      // ensure we focus the input field if autofocus is enabled
      if (!!input.value && props.autofocus) { input.value.focus() }
    })

    return {
      props,
      focus,
      input,
      shouldWrap,
      inputText,
      inputItems,
      hasError,
      hasWarning,
      onFocus,
      onBlur,
      setFocus,
      isNumber,
      onEnter,
      onEscape
    }
  }
})

</script>

<style lang="scss" scoped>
@import '@/uiKit/assets/index.scss';

.text-input {
  display: block;
  width: 100%;

  &__label {
    color: $colorContentSecondary;
    @include typography(sm, inter, 500);
    margin-bottom: $spacing-2;

    &--optional {
      color: $colorContentTertiary;
    }

    &--warning,
    &--info,
    &--error {
      margin-top: $spacing-2;
    }

    &--warning {
      color: $colorStatusWarning;
    }

    &--error {
      color: $colorStatusNegative;
    }
  }

  &__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: $heightInput;
    width: 100%;
    background: $colorNeutralsLightWhite;
    padding: 0 $spacing-4;
    border-radius: $borderRadius10;
    border: 1px solid $colorNeutralsLight300;
    transition: $transitionBorder, $transitionBackground;

    &:hover {
      background: $colorNeutralsLight100;
    }

    &--focused {
      border: 1px solid $colorInteractivePrimaryDefault;
      background-color: $colorSurfaceDefault;
      caret-color: $colorInteractivePrimaryDefault;
    }

    &--disabled {
      background-color: $colorInteractiveSecondaryDisabled;
      cursor: not-allowed;
    }

    &--error {
      border: 1.5px solid $colorStatusNegative;
      border: none;
    }

    &--warning {
      border: 1.5px solid $colorStatusWarning;
      border: none;
    }

    &__input {
      @include typography(md-1, inter, 500);
      color: $colorNeutralsLight900;
      background-color: transparent;
      height: 100%;
      width: 100%;

      &--multiple--wrap {
        display: flex;
        flex: 1 0;
        height: $heightInputThin;
        @include ellipsis(1, md-1);
      }

      &:disabled {
        color: $colorNeutralsLight400;
        cursor: not-allowed;

        &::placeholder {
          color: $colorNeutralsLight400;
        }
      }

      &::placeholder {
        color: $colorNeutralsLight600;
      }
    }

    &__items {
      @include row;
      flex-wrap: wrap;
      gap: $spacing-2;
      width: auto;
      height: 100%;
      width: 100%;

      .badge {
        max-width: 160px;

        &:deep(.badge__content__label) {
          @include ellipsis(1, md);
        }
      }
    }

    &--wrap {
      flex-wrap: wrap;
      height: auto !important;
      max-height: 240px;
      padding: $spacing-4;
      gap: $spacing-4;
      @include scrollbarV2;

      &:focus,
      &:active {
        outline: none;
      }
    }

    &__icon {
      @include row--center;
      align-items: center;
      width: $heightIcon;
      height: $heightIcon;
      margin-left: $spacing-2;
    }
  }
}
</style>
