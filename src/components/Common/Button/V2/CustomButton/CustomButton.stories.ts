import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'
import Vue from 'vue'

import {
  CustomButton,
  ButtonColor,
  ButtonFlair,
  ButtonProps,
  CustomButtonSize,
  ButtonTag,
  ButtonVariant
} from '@/components/Common/Button/V2'
import Shortcut, { ShortcutProps, ShortcutSize } from '@/components/Common/Shortcut'

export default {
  title: 'Common/Button/V2/CustomButton',
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: Object.entries(ButtonVariant).map((val) => val[1])
      },
      description: 'Changes Button variant. Choose between - DEFAULT | OUTLINE',
      table: {
        type: { summary: 'ButtonVariant' },
        defaultValue: { summary: 'ButtonVariant.DEFAULT' }
      }
    },
    color: {
      control: {
        type: 'select',
        options: Object.entries(ButtonColor).map((val) => val[1])
      },
      description:
        `Changes Button variant. Choose between - ${Object.entries(ButtonColor).join(' | ')}`,
      table: {
        type: { summary: 'ButtonColor' },
        defaultValue: { summary: 'ButtonColor.PRIMARY' }
      }
    },
    size: {
      control: {
        type: 'select',
        options: Object.entries(CustomButtonSize).map((val) => val[1])
      },
      description: 'Changes Button size. Choose between - SMALL | MEDIUM | LARGE',
      table: {
        type: { summary: 'ButtonSize' },
        defaultValue: { summary: 'ButtonSize.SMALL' }
      }
    },
    flair: {
      control: {
        type: 'select',
        options: Object.entries(ButtonFlair).map((val) => val[1])
      },
      description: 'Changes Button style. Choose between - SUPER_SOFT | SOFT | ROUNDED',
      table: {
        type: { summary: 'ButtonFlair' },
        defaultValue: { summary: 'ButtonFlair.ROUNDED' }
      }
    },
    tag: {
      control: {
        type: 'select',
        options: Object.entries(ButtonTag).map((val) => val[1])
      },
      description: 'Changes Button tag. Choose between - BUTTON | ROUTER LINK | A | DIV',
      table: {
        type: { summary: 'ButtonTag' },
        defaultValue: { summary: 'ButtonTag.BUTTON' }
      }
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable the button'
    }
  }
} as Meta<typeof CustomButton>

// VARIANT DEFAULT
export const VariantDefault: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})

// VARIANT OUTLINE
export const VariantOutline: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
VariantOutline.args = {
  variant: ButtonVariant.OUTLINE
}

// SIZE SMALL
export const SizeSmall: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
SizeSmall.args = {
  variant: ButtonVariant.OUTLINE,
  size: CustomButtonSize.SMALL
}

// SIZE MEDIUM
export const SizeMedium: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
SizeMedium.args = {
  variant: ButtonVariant.OUTLINE,
  size: CustomButtonSize.MEDIUM
}

// SIZE LARGE
export const SizeLarge: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
SizeLarge.args = {
  variant: ButtonVariant.OUTLINE,
  size: CustomButtonSize.LARGE
}

// COLOR PRIMARY
export const ColorPrimary: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
ColorPrimary.args = {
  color: ButtonColor.PRIMARY
}

// COLOR SECONDARY
export const ColorSecondary: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
ColorSecondary.args = {
  color: ButtonColor.SECONDARY
}

// COLOR POSITIVE
export const ColorPositive: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
ColorPositive.args = {
  color: ButtonColor.POSITIVE
}

// COLOR NEGATIVE
export const ColorNegative: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
ColorNegative.args = {
  color: ButtonColor.NEGATIVE
}

// COLOR PRIMARY DISABLED
export const ColorPrimaryDisabled: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
ColorPrimaryDisabled.args = {
  color: ButtonColor.PRIMARY,
  disabled: true
}

// COLOR SECONDARY DISABLED
export const ColorSecondaryDisabled: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
ColorSecondaryDisabled.args = {
  color: ButtonColor.SECONDARY,
  disabled: true
}

// COLOR POSITIVE DISABLED
export const ColorPositiveDisabled: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
ColorPositiveDisabled.args = {
  color: ButtonColor.POSITIVE,
  disabled: true
}

// COLOR NEGATIVE DISABLED
export const ColorNegativeDisabled: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
ColorNegativeDisabled.args = {
  color: ButtonColor.NEGATIVE,
  disabled: true
}

// FLAIR SUPER SOFT
export const FlairSuperSoft: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
FlairSuperSoft.args = {
  flair: ButtonFlair.SUPER_SOFT
}

// FLAIR SOFT
export const FlairSoft: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
FlairSoft.args = {
  flair: ButtonFlair.SOFT
}

// FLAIR ROUNDED
export const FlairRounded: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
FlairRounded.args = {
  flair: ButtonFlair.ROUNDED
}

// TAG BUTTON
export const TagButton: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
TagButton.args = {
  tag: ButtonTag.BUTTON,
  disabled: true
}

// TAG ROUTER BUTTON
export const TagRouterButton: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props" to="/">Default Label</custom-button>'
})
TagRouterButton.args = {
  tag: ButtonTag.ROUTER,
  disabled: true
}

// TAG ROUTER LINK DISABLED
export const TagRouterLinkDisabled: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props" to="/">Default Label</custom-button>'
})
TagRouterLinkDisabled.args = {
  color: ButtonColor.NEGATIVE,
  tag: ButtonTag.ROUTER,
  disabled: true
}

// TAG A BUTTON
export const TagAButton: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
TagAButton.args = {
  tag: ButtonTag.A
}

// TAG DIV LINK
export const TagDivLink: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
TagDivLink.args = {
  tag: ButtonTag.DIV
}

// TAG DIV LINK DISABLED
export const TagDivLinkDisabled: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<custom-button v-bind="$props">Default Label</custom-button>'
})
TagDivLinkDisabled.args = {
  tag: ButtonTag.DIV,
  disabled: true
}

// PREFIX ICON SMALL
export const PrefixIconSmall: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <custom-button v-bind="$props">
      <template #prefix-icon>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <path
            d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
      Default Label
    </custom-button>`
})
PrefixIconSmall.args = {
  color: ButtonColor.PRIMARY,
  size: CustomButtonSize.SMALL,
  flair: ButtonFlair.ROUNDED
}

// PREFIX ICON MEDIUM
export const PrefixIconMedium: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <custom-button v-bind="$props">
      <template #prefix-icon>
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <path
            d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
      Default Label
    </custom-button>`
})
PrefixIconMedium.args = {
  color: ButtonColor.PRIMARY,
  size: CustomButtonSize.MEDIUM,
  flair: ButtonFlair.ROUNDED
}

// PREFIX ICON LARGE
export const PrefixIconLarge: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <custom-button v-bind="$props">
      <template #prefix-icon>
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <path
            d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
      Default Label
    </custom-button>`
})
PrefixIconLarge.args = {
  color: ButtonColor.PRIMARY,
  size: CustomButtonSize.LARGE,
  flair: ButtonFlair.ROUNDED
}

// SUFFIX ICON SMALL
export const SuffixIconSmall: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <custom-button v-bind="$props">
      <template #suffix-icon>
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <path
            d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
      Default Label
    </custom-button>`
})
SuffixIconSmall.args = {
  color: ButtonColor.PRIMARY,
  size: CustomButtonSize.SMALL,
  flair: ButtonFlair.ROUNDED
}

// SUFFIX ICON MEDIUM
export const SuffixIconMedium: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <custom-button v-bind="$props">
      <template #suffix-icon>
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <path
            d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
      Default Label
    </custom-button>`
})
SuffixIconMedium.args = {
  color: ButtonColor.PRIMARY,
  size: CustomButtonSize.MEDIUM,
  flair: ButtonFlair.ROUNDED
}

// SUFFIX ICON LARGE
export const SuffixIconLarge: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <custom-button v-bind="$props">
      <template #suffix-icon>
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <path
            d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
      Default Label
    </custom-button>`
})
SuffixIconLarge.args = {
  color: ButtonColor.PRIMARY,
  size: CustomButtonSize.LARGE,
  flair: ButtonFlair.ROUNDED
}

// BOTH ICONS SMALL
export const BothIconsSmall: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <custom-button v-bind="$props">
      <template #prefix-icon>
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <path
            d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
      Default Label
      <template #suffix-icon>
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <path
            d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
    </custom-button>`
})
BothIconsSmall.args = {
  color: ButtonColor.PRIMARY,
  size: CustomButtonSize.SMALL,
  flair: ButtonFlair.ROUNDED
}

// BOTH ICONS MEDIUM
export const BothIconsMedium: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <custom-button v-bind="$props">
      <template #prefix-icon>
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <path
            d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
      Default Label
      <template #suffix-icon>
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <path
            d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
    </custom-button>`
})
BothIconsMedium.args = {
  color: ButtonColor.PRIMARY,
  size: CustomButtonSize.MEDIUM,
  flair: ButtonFlair.ROUNDED
}

// BOTH ICONS LARGE
export const BothIconsLarge: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { CustomButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <custom-button v-bind="$props">
      <template #prefix-icon>
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <path
            d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
      Default Label
      <template #suffix-icon>
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <path
            d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
    </custom-button>`
})
BothIconsLarge.args = {
  color: ButtonColor.PRIMARY,
  size: CustomButtonSize.LARGE,
  flair: ButtonFlair.ROUNDED
}

// SHORTCUT PROPS
type WithShortcutProps = Omit<ShortcutProps, 'size'> & ButtonProps & {
  label: string,
  shortcut: string
}

// WITH SHORTCUT SMALL
export const WithShortcutSmall: Story<WithShortcutProps> =
  (args, { argTypes }) => Vue.extend({
    components: { CustomButton, Shortcut },
    computed: {
      buttonProps (): ButtonProps {
        const { color, flair, fullWidth, size, tag, variant } = this.$props as WithShortcutProps

        return { color, flair, fullWidth, size, tag, variant }
      },

      shortcutProps (): ShortcutProps {
        const $props = this.$props as WithShortcutProps
        const { alt, cmd, ctrl, shift } = $props
        const inverted: boolean = !!$props.color &&
          [
            ButtonColor.PRIMARY,
            ButtonColor.POSITIVE,
            ButtonColor.NEGATIVE,
            ButtonColor.WARNING
          ].includes($props.color)
        let size: ShortcutSize

        switch ($props.size) {
          case CustomButtonSize.MEDIUM:
            size = ShortcutSize.MEDIUM; break
          case CustomButtonSize.LARGE:
            size = ShortcutSize.LARGE; break
          default:
            size = ShortcutSize.SMALL
        }

        return { alt, cmd, ctrl, inverted, shift, size }
      }
    },
    props: Object.keys(argTypes),
    methods: { onClick: action('onClick') },
    template: `
      <custom-button v-bind="buttonProps">
        {{ label }}
        <template #suffix-icon>
          <shortcut v-bind="shortcutProps" style="margin-left:0.25rem">{{ shortcut }}</shortcut>
        </template>
      </custom-button>
    `
  })
WithShortcutSmall.args = {
  alt: false,
  color: ButtonColor.PRIMARY,
  cmd: false,
  ctrl: false,
  flair: ButtonFlair.ROUNDED,
  label: 'Button',
  shift: false,
  shortcut: '↵',
  size: CustomButtonSize.SMALL,
  variant: ButtonVariant.DEFAULT
}

// WITH SHORTCUT MEDIUM
export const WithShortcutMedium: Story<WithShortcutProps> =
  (args, { argTypes }) => Vue.extend({
    components: { CustomButton, Shortcut },
    computed: {
      buttonProps () {
        const { color, flair, fullWidth, size, tag, variant } = this.$props as WithShortcutProps

        return { color, flair, fullWidth, size, tag, variant }
      },

      shortcutProps (): ShortcutProps {
        const $props = this.$props as WithShortcutProps
        const { alt, cmd, ctrl, shift } = $props
        const inverted: boolean = !!$props.color &&
          [
            ButtonColor.PRIMARY,
            ButtonColor.POSITIVE,
            ButtonColor.NEGATIVE,
            ButtonColor.WARNING
          ].includes($props.color)
        let size: ShortcutSize

        switch ($props.size) {
          case CustomButtonSize.MEDIUM:
            size = ShortcutSize.MEDIUM; break
          case CustomButtonSize.LARGE:
            size = ShortcutSize.LARGE; break
          default:
            size = ShortcutSize.SMALL
        }

        return { alt, cmd, ctrl, inverted, shift, size }
      }
    },
    props: Object.keys(argTypes),
    methods: { onClick: action('onClick') },
    template: `
      <custom-button v-bind="buttonProps">
        {{ label }}
        <template #suffix-icon>
          <shortcut v-bind="shortcutProps" style="margin-left:0.25rem">{{ shortcut }}</shortcut>
        </template>
      </custom-button>
    `
  })
WithShortcutMedium.args = {
  alt: false,
  color: ButtonColor.PRIMARY,
  cmd: false,
  ctrl: false,
  flair: ButtonFlair.ROUNDED,
  label: 'Button',
  shift: false,
  shortcut: '↵',
  size: CustomButtonSize.MEDIUM,
  variant: ButtonVariant.DEFAULT
}

// WITH SHORTCUT LARGE
export const WithShortcutLarge: Story<WithShortcutProps> =
  (args, { argTypes }) => Vue.extend({
    components: { CustomButton, Shortcut },
    computed: {
      buttonProps (): ButtonProps {
        const { color, flair, fullWidth, size, tag, variant } = this.$props as WithShortcutProps

        return { color, flair, fullWidth, size, tag, variant }
      },

      shortcutProps (): ShortcutProps {
        const $props = this.$props as WithShortcutProps
        const { alt, cmd, ctrl, shift } = $props
        const inverted: boolean = !!$props.color &&
          [
            ButtonColor.PRIMARY,
            ButtonColor.POSITIVE,
            ButtonColor.NEGATIVE,
            ButtonColor.WARNING
          ].includes($props.color)
        let size: ShortcutSize

        switch ($props.size) {
          case CustomButtonSize.MEDIUM:
            size = ShortcutSize.MEDIUM; break
          case CustomButtonSize.LARGE:
            size = ShortcutSize.LARGE; break
          default:
            size = ShortcutSize.SMALL
        }

        return { alt, cmd, ctrl, inverted, shift, size }
      }
    },
    props: Object.keys(argTypes),
    methods: { onClick: action('onClick') },
    template: `
      <custom-button v-bind="buttonProps">
        {{ label }}
        <template #suffix-icon>
          <shortcut v-bind="shortcutProps" style="margin-left:0.25rem">{{ shortcut }}</shortcut>
        </template>
      </custom-button>
    `
  })
WithShortcutLarge.args = {
  alt: false,
  color: ButtonColor.PRIMARY,
  cmd: false,
  ctrl: false,
  flair: ButtonFlair.ROUNDED,
  label: 'Button',
  shift: false,
  shortcut: '↵',
  size: CustomButtonSize.MEDIUM,
  variant: ButtonVariant.DEFAULT
}
