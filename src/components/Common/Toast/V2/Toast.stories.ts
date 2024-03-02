import { Meta, Story } from '@storybook/vue'

import ExtendedToast from './ExtendedToast.vue'
import MinimalToast from './MinimalToast.vue'
import ToastController from './ToastController.stories.vue'
import ToastTemplate from './ToastTemplate.vue'
import { ToastProps } from './types'

export default {
  title: 'Common/Toast/V2'
} as Meta<typeof ToastTemplate>

const meta: ToastProps['meta'] = {
  title: 'There was a problem with that action',
  desc:
    `Lorem ipsum dolor sit amet consectetur adipisicing elit.
     Aliquid pariatur, ipsum similique veniam. Lorem ipsum dolor sit amet
     consectetur adipisicing elit. Aliquid pariatur, ipsum similique veniam.`
}

export const Model: Story<ToastProps> = (args, { argTypes }) => ({
  components: { ToastTemplate, MinimalToast, ExtendedToast },
  props: Object.keys(argTypes),
  template: `
    <div>
      <minimal-toast v-bind="$props" variant="default" style='opacity: 1;' />
      <minimal-toast
        v-bind="$props" variant="error" style='opacity: 1;transform: translateY(80px)' />
      <minimal-toast
        v-bind="$props" variant="warning" style='opacity: 1;transform: translateY(160px)' />
      <minimal-toast
        v-bind="$props" variant="success" style='opacity: 1;transform: translateY(240px)' />
      <extended-toast
        v-bind="$props" variant="default" style='opacity: 1;transform: translateY(330px)' />
      <extended-toast
        v-bind="$props" variant="error" style='opacity: 1;transform: translateY(460px)' />
      <extended-toast
        v-bind="$props" variant="warning" style='opacity: 1;transform: translateY(590px)' />
      <extended-toast
        v-bind="$props" variant="success" style='opacity: 1;transform: translateY(720px)' />
      <extended-toast
        variant="success"
        :meta='{ title: "This is an alert" }'
        style='opacity: 1;transform: translateY(850px)'
      />
    </div>
  `
})

Model.args = {
  meta
}

export const Controller: Story = (args, { argTypes }) => ({
  components: { ToastController },
  props: Object.keys(argTypes),
  template: '<toast-controller />'
})
