<template>
  <div
    class="select-field"
    tabindex="0"
    @blur="onBlur"
  >
    <div
      class="select-field__input"
      :class="{
        'select-field__input--open': open,
        'select-field__input--disabled': disabled
      }"
      @click="onOpen"
    >
      <span
        v-if="!!label || hasLabel"
        class="select-field__input__label"
      >
        <slot name="label">
          {{ label }}
        </slot>
      </span>
      <span
        class="select-field__input__icon"
        :class="{ 'select-field__input__icon--open': open }"
      >
        <slot name="icon">
          <chevron-icon />
        </slot>
      </span>
    </div>
    <popup-menu
      ref="popup-menu"
      v-if="open"
      class="popup-menu popup-menu-select-field"
      :class="{
        [popupMenuClassname]: !!popupMenuClassname,
        'popup-menu--open': open
      }"
      @click:outside="onClickOutside"
    >
      <div class="popup-menu__wrapper">
        <slot name="dropdown-header" />
        <div
          v-if="options.length > 0"
          class="popup-menu__content"
        >
          <template v-for="option in options">
            <slot :option="option">
              <list-element-v2
                class="popup-menu__content__item"
                :key="option.id"
                :text="option.text"
                :selected="option.id === selected"
                @click="onSelect(option)"
              />
            </slot>
          </template>
        </div>
        <div
          v-else
          class="popup-menu__no-content"
        >
          {{ empty }}
        </div>
        <slot name="dropdown-footer" />
      </div>
    </popup-menu>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  onMounted,
  PropType,
  ref,
  Ref,
  SetupContext,
  useSlots,
  watch
} from 'vue'

import ListElementV2 from '@/components/Common/ListElements/ListElementV2/ListElementV2.vue'
import { ListElementV2Props } from '@/components/Common/ListElements/ListElementV2/types'
import PopupMenu from '@/components/Common/PopupMenu/V2/PopupMenu.vue'
import { ChevronIcon } from '@/components/Common/SelectField/V2'
import { useHotkeysNavigation } from '@/composables'
import { getIdNext } from '@/utils/array'

/**
 * Simple select field
 *
 * @param {*} value - fields value
 * @param {*[]} options - fields options
 * @param {string} label - fields label
 * @param {boolean} required - marks field as required (html form validation)
 */
export default defineComponent({
  name: 'SelectField',
  components: { ChevronIcon, PopupMenu, ListElementV2 },
  props: {
    value: { default: '', type: [Object, Number, String, Array, Date] },
    options: { required: true, type: Array as PropType<ListElementV2Props[]> },
    label: { default: 'Select an option', type: String },
    popupMenuClassname: { default: '', type: String },
    empty: { default: 'No item found', type: String },
    required: { default: false, type: Boolean },
    disabled: { default: false, type: Boolean },
    custom: { default: false, type: Boolean },
    emitOnNavigation: { default: true, type: Boolean }
  },
  setup (props, { emit }: SetupContext) {
    const slots = useSlots()

    const popupMenu = ref<PopupMenu>()
    const selected: Ref<string> = ref('')
    const open: Ref<boolean> = ref(false)

    const hasCustomLabel = computed((): boolean => {
      return !!slots['label']
    })

    const selectedIdx = computed((): number => {
      return props.options.findIndex(({ id }) => id === selected.value)
    })

    const onOpen = (): void => {
      if (!props.custom) {
        emit(open.value ? 'close' : 'open')
        open.value = !open.value
      } else {
        setTimeout(() => {
          emit(open.value ? 'close' : 'open')
          open.value = !open.value
        }, 100)
      }
    }

    const onClose = (): void => {
      setTimeout(() => {
        emit('close')
        open.value = false
      }, 100)
    }

    const onBlur = (): void => {
      if (props.custom) { return }
      onClose()
    }

    const onClickOutside = (): void => {
      if (!props.custom || !open.value) { return }
      onClose()
    }

    const onSelect = (option: any): void => {
      const { id } = option
      selected.value = id
      emit('input', option)
      onClose()
    }

    watch(selected, () => {
      if (popupMenu.value) { (popupMenu.value.$el as any).focus() }
    })

    onMounted((): void => {
      const option = props.options.find(({ id }) => id === props.value)
      if (option || props.options[0]) {
        const { id } = option || props.options[0]
        selected.value = id
      }
    })

    useHotkeysNavigation({
      condition: open,
      handlers: {
        increase: () => {
          const newId = getIdNext(selectedIdx.value, props.options.length, true)
          selected.value = props.options[newId]?.id
          if (props.emitOnNavigation) { emit('input', props.options[newId]) }
        },
        decrease: () => {
          const newId = getIdNext(selectedIdx.value, props.options.length, false)
          selected.value = props.options[newId]?.id
          if (props.emitOnNavigation) { emit('input', props.options[newId]) }
        },
        submit: () => {
          onSelect(props.options[selectedIdx.value])
        },
        close: () => {
          onClose()
        }
      },
      name: 'select field V2'
    })

    return {
      hasCustomLabel,
      popupMenu,
      selected,
      open,
      selectedIdx,
      onOpen,
      onClose,
      onBlur,
      onClickOutside,
      onSelect
    }
  }
})
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
.popup-menu-select-field .popup-menu__content {
  @include col;
  @include scrollbarV2;
  padding: 4px;
}
</style>

<style lang="scss" scoped>

$height: 36px;

.select-field {
  @include row--center;
  position: relative;
  height: $height;
  max-height: $height;
  outline: none;

  &__input {
    @include row--distributed--center;
    flex: 1 1 auto;
    height: 100%;
    max-height: 100%;
    @include typographyRegularBody100;
    outline: 1px solid $colorInteractiveSecondaryHover;
    color: $colorContentDefault;
    background-color: transparent;
    padding: 0 8.5px;
    border-radius: 10px;
    cursor: pointer;
    user-select: none;

    &__label {
      @include row--center;
      @include ellipsis(1, md);
      text-transform: lowercase;
    }

    &__icon {
      @include row--center;
      margin-left: 7.5px;

      &--open {
        transform: rotateZ(-180deg);
      }
    }

    &--disabled {
      opacity: 0.5;
    }

    &:hover {
      background-color: $colorOverlayHover;
    }

    &--open,
    &:active, &:focus {
      outline: none;
      outline: 1.5px solid $colorInteractivePrimaryDefault;
      caret-color: $colorInteractivePrimaryDefault;
      color: $colorContentEmphasis;
    }
  }

  .popup-menu {
    display: none;
    position: absolute;
    top: calc(#{$height} + 4px);
    z-index: 1;
    background-color: $colorWhite;

    &--open {
      display: block;
    }

    &__wrapper {
      position: relative;
      max-width: 100%;
      overflow: hidden;
    }

    &__content {
      width: 100%;
      max-width: 100%;
      max-height: 600px;
      height: auto;
      padding: 0;
      overflow-y: auto;
      overflow-x: hidden;
    }

    &__no-content {
      @include row--center;
      align-items: center;
      @include typography(md, inter);
      @include ellipsis(3, md);
      margin: 12px auto;
      text-align: center;
      max-width: 80%;
      color: $colorContentSecondary;
    }
  }
}
</style>
