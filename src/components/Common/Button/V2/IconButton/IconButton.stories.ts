import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import {
  IconButton,
  ButtonColor,
  ButtonFlair,
  ButtonProps,
  IconButtonSize,
  ButtonTag,
  ButtonVariant
} from '@/components/Common/Button/V2'

export default {
  title: 'Common/Button/V2/IconButton',
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: Object.values(ButtonVariant)
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
        options: Object.values(ButtonColor)
      },
      description:
        `Changes Button variant. Choose between - ${Object.values(ButtonColor)}.join(' | ')`,
      table: {
        type: { summary: 'ButtonColor' },
        defaultValue: { summary: 'ButtonColor.PRIMARY' }
      }
    },
    size: {
      control: {
        type: 'select',
        options: Object.values(IconButtonSize)
      },
      description: 'Changes Button size. Choose between - MINI | SMALL | MEDIUM | LARGE',
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
    }
  }
} as Meta<typeof IconButton>

// VARIANT DEFAULT
export const VariantDefault: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { IconButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <icon-button v-bind="$props">
      <svg
        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </icon-button>`
})
VariantDefault.args = {
  color: ButtonColor.PRIMARY,
  flair: ButtonFlair.ROUNDED
}

// VARIANT OUTLINE
export const VariantOutline: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { IconButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <icon-button v-bind="$props">
      <svg
        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10.0001 5.9999V14.0001"
          stroke="rgba(75, 81, 88, 1)" stroke-width="1.5" stroke-linecap="round"/>
        <path
          d="M5.9999 10.0001H14.0001"
          stroke="rgba(75, 81, 88, 1)" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </icon-button>`
})
VariantOutline.args = {
  variant: ButtonVariant.OUTLINE,
  color: ButtonColor.PRIMARY,
  flair: ButtonFlair.ROUNDED
}

// SIZE MINI
export const SizeMini: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { IconButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <icon-button v-bind="$props">
      <svg
        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </icon-button>`
})
SizeMini.args = {
  color: ButtonColor.PRIMARY,
  size: IconButtonSize.MINI,
  flair: ButtonFlair.ROUNDED
}

// SIZE SMALL
export const SizeSmall: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { IconButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <icon-button v-bind="$props">
      <svg
        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </icon-button>`
})
SizeSmall.args = {
  color: ButtonColor.PRIMARY,
  size: IconButtonSize.SMALL,
  flair: ButtonFlair.ROUNDED
}

// SIZE MEDIUM
export const SizeMedium: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { IconButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <icon-button v-bind="$props">
      <svg
        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </icon-button>`
})
SizeMedium.args = {
  color: ButtonColor.PRIMARY,
  size: IconButtonSize.MEDIUM,
  flair: ButtonFlair.ROUNDED
}

// SIZE LARGE
export const SizeLarge: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { IconButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <icon-button v-bind="$props">
      <svg
        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </icon-button>`
})
SizeLarge.args = {
  color: ButtonColor.PRIMARY,
  size: IconButtonSize.LARGE,
  flair: ButtonFlair.ROUNDED
}

// COLOR PRIMARY
export const ColorPrimary: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { IconButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <icon-button v-bind="$props">
      <svg
        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </icon-button>`
})
ColorPrimary.args = {
  color: ButtonColor.PRIMARY,
  flair: ButtonFlair.ROUNDED
}

// COLOR SECONDARY
export const ColorSecondary: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { IconButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <icon-button v-bind="$props">
      <svg
        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </icon-button>`
})
ColorSecondary.args = {
  color: ButtonColor.SECONDARY,
  flair: ButtonFlair.ROUNDED
}

// COLOR POSITIVE
export const ColorPositive: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { IconButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <icon-button v-bind="$props">
      <svg
        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </icon-button>`
})
ColorPositive.args = {
  color: ButtonColor.POSITIVE,
  flair: ButtonFlair.ROUNDED
}

// COLOR NEGATIVE
export const ColorNegative: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { IconButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <icon-button v-bind="$props">
      <svg
        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </icon-button>`
})
ColorNegative.args = {
  color: ButtonColor.NEGATIVE,
  flair: ButtonFlair.ROUNDED
}

// FLAIR SUPER SOFT
export const FlairSuperSoft: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { IconButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <icon-button v-bind="$props">
      <svg
        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </icon-button>`
})
FlairSuperSoft.args = {
  flair: ButtonFlair.SUPER_SOFT,
  color: ButtonColor.PRIMARY
}

// FLAIR SOFT
export const FlairSoft: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { IconButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <icon-button v-bind="$props">
      <svg
        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </icon-button>`
})
FlairSoft.args = {
  flair: ButtonFlair.SOFT,
  color: ButtonColor.PRIMARY
}

// FLAIR ROUNDED
export const FlairRounded: Story<ButtonProps> = (args, { argTypes }) => ({
  components: { IconButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <icon-button v-bind="$props">
      <svg
        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0001 5.9999V14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M5.9999 10.0001H14.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </icon-button>`
})
FlairRounded.args = {
  flair: ButtonFlair.ROUNDED,
  color: ButtonColor.PRIMARY
}
