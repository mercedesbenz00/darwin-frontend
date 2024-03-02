import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import TwitterButton from '@/components/Common/Social/TwitterButton.vue'

type TwitterButtonProps = {
  url: string | null,
  description: string | null,
  btnText: string | null,
  modalWidth: number | null,
  modalHeight: number | null,
  isBlank: boolean | null,
  hasIcon: boolean | null,
  customIcon: string | null
}

export default {
  title: 'Common/Social/TwitterButton',
  argTypes: {
    btnText: { control: 'string' },
    url: { control: 'string' },
    description: { control: 'string' },
    isBlank: { control: 'boolean' },
    hasIcon: { control: 'boolean' }
  }
} as Meta<typeof TwitterButton>

export const Default: Story<TwitterButtonProps> = (args, { argTypes }) => ({
  components: { TwitterButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<twitter-button v-bind="$props"/>'
})
Default.storyName = 'TwitterButton'
