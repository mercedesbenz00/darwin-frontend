import Vue from 'vue'

import { slider } from '@/storybook/controls/slider'

import ConfirmationDialogLayout from './ConfirmationDialogLayout.vue'

const argTypes = {
  title: 'text',
  description: 'text',
  width: slider(200, 1000)
}

export const ConfirmationTypeTwoButtons = () => Vue.extend({
  components: { ConfirmationDialogLayout },
  props: Object.keys(argTypes),
  computed: {
    style () {
      return { width: `${this.width}px` }
    }
  },
  template: `
    <confirmation-dialog-layout :style="style">
      <template #title>{{title}}</template>
      <template #description>{{description}}</template>
      <template #footer>
        <secondary-button>Cancel</secondary-button>
        <primary-button>DO THE LONG THING!</primary-button>
      </template>
    </confirmation-dialog-layout>
  `
})

ConfirmationTypeTwoButtons.argTypes = { ...argTypes }

ConfirmationTypeTwoButtons.args = {
  width: 450,
  title: 'Are you sure you wish to do this dangerous thing?',
  description: 'This is very dangerous and will do very bad stuff if you do it.'
}

export const ConfirmationTypeOneButton = () => Vue.extend({
  components: { ConfirmationDialogLayout },
  props: Object.keys(argTypes),
  computed: {
    style () {
      return { width: `${this.width}px` }
    }
  },
  template: `
    <confirmation-dialog-layout :style="style">
      <template #title>{{title}}</template>
      <template #description>{{description}}</template>
      <template #footer>
        <primary-button>DO THE THING!</primary-button>
      </template>
    </confirmation-dialog-layout>
  `
})

ConfirmationTypeOneButton.argTypes = {
  width: slider(200, 1000)
}

ConfirmationTypeOneButton.argTypes = { ...argTypes }
ConfirmationTypeOneButton.args = {
  ...ConfirmationTypeTwoButtons.args
}
