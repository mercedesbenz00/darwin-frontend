import { Meta, Story } from '@storybook/vue'

import Toggle from './Toggle.vue'
import { TogglePosition, ToggleProps, ToggleSize } from './types'

export default {
  title: 'Common/Toggle/V2',
  component: Toggle,
  argTypes: {
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    onInput: { action: 'input' },
    position: { control: 'radio', options: Object.values(TogglePosition) },
    size: { control: 'radio', options: Object.values(ToggleSize) },
    value: { control: 'boolean' }
  }
} as Meta<typeof Toggle>

type Args = ToggleProps
const Template: Story<Args> = (args, { argTypes }) => ({
  components: { Toggle },
  props: Object.keys(argTypes),
  template: '<toggle v-bind="$props" @input="onInput" />'
})

type ArgsWithLabel = Args & { label: string }
const TemplateWithLabel: Story<ArgsWithLabel> = (args, { argTypes }) => ({
  components: { Toggle },
  props: Object.keys(argTypes),
  template: '<toggle v-bind="$props" @input="onInput">{{ label }}</toggle>'
})

type ArgsWithLabelAndTools = ArgsWithLabel & { tools: string }
const TemplateWithLabelAndTools: Story<ArgsWithLabelAndTools> = (args, { argTypes }) => ({
  components: { Toggle },
  props: Object.keys(argTypes),
  template: `
    <toggle v-bind="$props" @input="onInput" v-if="label">
      <template slot="default">{{ label }}</template>
      <template slot="tools">
        <button>Print</button>
      </template>
    </toggle>
  `
})

const defaultArgs = {
  disabled: false,
  label: '',
  value: true
}

export const SmallStart: Story<Args> = Template.bind({})
SmallStart.storyName = 'Small toggle'
SmallStart.args = {
  ...defaultArgs,
  position: TogglePosition.START,
  size: ToggleSize.SMALL
}

export const SmallStartWithLabel: Story<ArgsWithLabel> = TemplateWithLabel.bind({})
SmallStartWithLabel.storyName = 'Small toggle before label'
SmallStartWithLabel.args = {
  ...SmallStart.args,
  label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
}

export const SmallStartWithLabelAndTools: Story<ArgsWithLabelAndTools> =
  TemplateWithLabelAndTools.bind({})

SmallStartWithLabelAndTools.storyName = 'Small toggle before label with tools'
SmallStartWithLabelAndTools.args = {
  ...SmallStartWithLabel.args
}

export const SmallEndWithLabel: Story<ArgsWithLabel> = TemplateWithLabel.bind({})
SmallEndWithLabel.storyName = 'Small toggle after label'
SmallEndWithLabel.args = {
  ...SmallStartWithLabel.args,
  position: TogglePosition.END
}

export const SmallEndWithLabelAndTools: Story<ArgsWithLabelAndTools> =
  TemplateWithLabelAndTools.bind({})

SmallEndWithLabelAndTools.storyName = 'Small toggle after label with tools'
SmallEndWithLabelAndTools.args = {
  ...SmallEndWithLabel.args
}

export const SmallEndWithLabelAndToolsDisabled: Story<ArgsWithLabelAndTools> =
  TemplateWithLabelAndTools.bind({})

SmallEndWithLabelAndToolsDisabled.storyName = 'Small toggle after label with tools (disabled)'
SmallEndWithLabelAndToolsDisabled.args = {
  ...SmallEndWithLabel.args,
  disabled: true
}

export const LargeStart: Story<Args> = Template.bind({})
LargeStart.storyName = 'Large toggle'
LargeStart.args = {
  ...defaultArgs,
  position: TogglePosition.START,
  size: ToggleSize.LARGE
}

export const LargeStartWithLabel: Story<ArgsWithLabel> = TemplateWithLabel.bind({})
LargeStartWithLabel.storyName = 'Large toggle before label'
LargeStartWithLabel.args = {
  ...LargeStart.args,
  label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
}

export const LargeStartWithLabelAndTools: Story<ArgsWithLabelAndTools> =
  TemplateWithLabelAndTools.bind({})

LargeStartWithLabelAndTools.storyName = 'Large toggle before label with tools'
LargeStartWithLabelAndTools.args = {
  ...LargeStartWithLabel.args
}

export const LargeEndWithLabel: Story<ArgsWithLabel> = TemplateWithLabel.bind({})
LargeEndWithLabel.storyName = 'Large toggle after label'
LargeEndWithLabel.args = {
  ...LargeStartWithLabel.args,
  position: TogglePosition.END
}

export const LargeEndWithLabelAndTools: Story<ArgsWithLabelAndTools> =
  TemplateWithLabelAndTools.bind({})

LargeEndWithLabelAndTools.storyName = 'Large toggle after label with tools'
LargeEndWithLabelAndTools.args = {
  ...LargeEndWithLabel.args
}

export const LargeEndWithLabelAndToolsDisabled: Story<ArgsWithLabelAndTools> =
  TemplateWithLabelAndTools.bind({})

LargeEndWithLabelAndToolsDisabled.storyName = 'Large toggle after label with tools (disabled)'
LargeEndWithLabelAndToolsDisabled.args = {
  ...LargeEndWithLabelAndTools.args,
  disabled: true
}
