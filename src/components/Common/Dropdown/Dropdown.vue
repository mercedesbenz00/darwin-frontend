<template>
  <v-select
    class="dropdown"
    v-bind="props"
    label="label"
    :class="theme === 'light' ? 'dropdown--light' : 'dropdown--dark'"
    :calculate-position="calculatePosition"
    :components="components"
    :clearable="clearable"
    v-on="$listeners"
  >
    <!-- Pass on any named slots -->
    <template #header>
      <slot name="header" />
    </template>
    <template #footer>
      <slot name="footer" />
    </template>
    <template #list-header>
      <slot name="list-header" />
    </template>
    <template #list-footer>
      <slot name="list-footer" />
    </template>

    <!-- Pass on any scoped slots -->
    <template #no-options="scope">
      <slot
        name="no-options"
        v-bind="scope"
      />
    </template>

    <template
      v-if="$scopedSlots['open-indicator']"
      #open-indicator="scope"
    >
      <slot
        name="open-indicator"
        v-bind="scope"
      />
    </template>

    <template
      v-else
      #open-indicator="{ attributes }"
    >
      <span
        class="dropdown__arrow"
        v-bind="attributes"
      />
    </template>

    <template #option="scope">
      <slot
        name="option"
        v-bind="scope"
      />
    </template>

    <template #search="scope">
      <slot
        name="search"
        v-bind="scope"
      />
    </template>

    <template #selected-option="scope">
      <div class="dropdown__value">
        <slot
          name="selected-option"
          v-bind="scope"
        >
          {{ scope.label }}
        </slot>
      </div>
    </template>

    <!-- needs to be optional, or it overrides #selected-option -->
    <template
      v-if="$scopedSlots['selected-option-container']"
      #selected-option-container="scope"
    >
      <slot
        name="selected-option-container"
        v-bind="scope"
      />
    </template>

    <template #spinner="scope">
      <slot
        name="spinner"
        v-bind="scope"
      />
    </template>
  </v-select>
</template>

<script lang="ts">
import { createPopper } from '@popperjs/core'
import { Component, Prop, Vue } from 'vue-property-decorator'
import VSelect from 'vue-select'

import 'vue-select/dist/vue-select.css'
import { XIcon } from '@/assets/icons/V1'

import { DropdownOption } from './types'

type VSelectParams = { width: string, top: string, left: string }
type VSelectComponent = InstanceType<typeof VSelect> & { $refs: { toggle: Element } }

const setPosition = (
  dropdownList: HTMLUListElement,
  component: VSelectComponent,
  params: VSelectParams
) => {
  /**
   * We need to explicitly define the dropdown width since
   * it is usually inherited from the parent with CSS.
   */
  dropdownList.style.width = params.width

  /**
   * Here we position the dropdownList relative to the $refs.toggle Element.
   *
   * The 'offset' modifier aligns the dropdown so that the $refs.toggle and
   * the dropdownList overlap by 1 pixel.
   *
   * The 'toggleClass' modifier adds a 'drop-up' class to the Vue Select
   * wrapper so that we can set some styles for when the dropdown is placed
   * above.
   */
  const popper = createPopper(component.$refs.toggle, dropdownList, {
    placement: 'bottom',
    modifiers: [
      {
        name: 'offset',
        options: { offset: [0, -1] }
      },
      {
        name: 'toggleClass',
        enabled: true,
        phase: 'write',
        fn ({ state }) {
          component.$el.classList.toggle('dropdown--up', state.placement === 'top')
        }
      }]
  })

  /**
   * To prevent memory leaks Popper needs to be destroyed.
   * If you return function, it will be called just before dropdown is removed from DOM.
   */
  return () => popper.destroy()
}

const setClass = (dropdownList: HTMLUListElement, className: string) => {
  dropdownList.classList.add(className)
}

@Component({
  name: 'dropdown',
  components: { VSelect }
})
export default class Dropdown extends Vue {
  /**
   * Should be used only if the dropdown is being rendered in an environment
   * where it needs to be visible regardless of parent overflow, such as near
   * the bottom of a modal.
   *
   * Is the component which relies on `appendToBody: true` needs custom styling,
   * then a custom class also needs to be set using `dropdownClassName`
   */
  @Prop({ required: false, default: false, type: Boolean })
  appendToBody!: boolean

  /**
   * Delegates to the 3rd party componantes. Indicate if the selection is
   * clerable.
   *
   * Renders X icon to clear selection, when true.
   */
  @Prop({ required: false, default: true, type: Boolean })
  clearable!: boolean

  /**
   * Should only be used if the component relies on `appendToBody: true`.
   *
   * Used to set a custom class on the list element. Since the element is
   * appended to `document.body`, styles for it need to be defined unscoped.
   */
  @Prop({ required: false, type: String, default: 'dropdown__list' })
  dropdownClassName!: string

  @Prop({ required: false, default: 'dark', type: String as () => 'light' | 'dark' })
  theme!: 'light' | 'dark'

  /**
   * Options for the dropdown. Should be an array.
   *
   * See documentation for vue-select on how to support other types of
   * collections.
   */
  @Prop({ required: false })
  options?: DropdownOption[]

  /**
   * Value for the dropdown. Should be an elements of the options prop.
   *
   * If dropdown is setup for multiselect, can be an array.
   */
  @Prop({ required: false })
  value?: DropdownOption | DropdownOption[]

  get props () {
    const { appendToBody, options, value } = this

    return {
      ...this.$attrs,
      appendToBody,
      options,
      value
    }
  }

  /**
   * vue-select currently does not allow a proper way to set class on the
   * dropdown list itself, which means that, when combined with
   * appendToBody, we cannot give the dropdown a component-specific style
   * this sets the class manually, and allows us to specify an unscoped
   * style on a component which needs to use `appendToBody: true`
   */
  calculatePosition (l: HTMLUListElement, c: VSelectComponent, p: VSelectParams): void {
    const { appendToBody, dropdownClassName } = this
    if (appendToBody) { setPosition(l, c, p) }

    setClass(l, dropdownClassName)
  }

  components = {
    Deselect: XIcon
  }
}
</script>

<style lang="scss" scoped>
$vs-dropdown-bg: $colorLineGrey;
$inputHeight: 36px;
$fontSize: 14px;

$vs-component-line-height: 18px !default;

.dropdown {
  height: $inputHeight;
  font-size: $fontSize;
  font-family: $fontFamilyMulish;

  border: none;
  color: $color90Black;
  box-shadow: inset 0px 2px 4px rgba(145, 169, 192, 0.3);
  border-radius: $border-radius-default;
  background: $colorAliceShade;

  // prevents content blowout if width of selected option is too much
  min-width: 0px;

  .dropdown__value {
    @include typography(md-1, Mulish);
  }

  :deep(.vs__dropdown-toggle) {
    width: 100%;
    height: 100%;
    border: none;

    .vs__selected,
    .vs__search {
      margin-top: 2px;
    }

    input.vs__search {
      display: none;
    }

    &[aria-expanded=true] input.vs__search {
      display: flex;
      align-self: center;
    }

    input.vs__search,
    input.vs__search::placeholder {
      @include typography(md-1, Mulish);
    }

    input.vs__search::placeholder {
      height: 100%;
      color: $colorAliceNight;
      display: flex;
      align-self: center;
    }

    .vs__actions svg {
      color: $colorAliceNight;
      height: 10px;
      width: 10px;
    }
  }

  :deep(.vs__selected),
  &.vs--open :deep(.vs__selected) {
    // prevents content blowout if width of selected option is too much
    min-width: 0px;
    width: 100%;
  }
}

.dropdown__value {
  @include ellipsis;
}

.dropdown--light {
  background: $colorAliceBlue;
}

.dropdown--dark {
  background: $colorAliceShade;
}

.dropdown__arrow {
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 7px solid $colorFeatherLight;
  border-bottom: none;
  left: auto;
  top: 55%;
  margin: 0;
  height: 0;
  width: 0;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.vs__selected-options {
  // prevents content blowout if width of selected option is too much
  min-width: 0px;
}

.vs__selected {
  height: 100%;
  border: none;
  box-sizing: border-box;
}

.vs__dropdown-menu {
  max-height: 50vh;
  padding: 10px 0;
  box-shadow: 0px 10px 20px rgba(145, 169, 192, 0.3);
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  border: none;
  overflow-y: auto;

  @include scrollbar;

  &[data-popper-placement="top"] {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  z-index: var(--z-index-v-select-body-appended-dropdown);
}

.vs__dropdown-option {
  padding: 5px;

  @include ellipsis;

  &.vs__dropdown-option--highlight {
    background: $colorAliceBlue;
    color: inherit;
  }
}
</style>
