import { Meta, Story } from '@storybook/vue'

import { StageType } from '@/store/types/StageType'

import StatusButton from './StatusButton.vue'
import { StatusButtonProps, StatusButtonSize, StatusButtonVariant } from './types'

export default {
  title: 'Workview/Common/StatusButton',
  argTypes: {
    type: {
      control: { type: 'select' },
      options: Object.entries(StageType).map((val) => val[1]),
      description: 'Status Button type',
      table: {
        type: { summary: 'DatasetItemStatus | StageType | ReviewStatus' },
        defaultValue: { summary: '-' }
      }
    },
    size: {
      control: { type: 'select' },
      options: Object.entries(StatusButtonSize).map((val) => val[1]),
      description: 'Status Button type',
      table: {
        type: { summary: 'DatasetItemStatus | StageType | ReviewStatus' },
        defaultValue: { summary: '-' }
      }
    },
    variant: {
      control: { type: 'select' },
      options: Object.entries(StatusButtonVariant).map((val) => val[1]),
      description: 'Status Button type',
      table: {
        type: { summary: 'DatasetItemStatus | StageType | ReviewStatus' },
        defaultValue: { summary: '-' }
      }
    }
  }
} as Meta<typeof StatusButton>

export const Default: Story = (args, { argTypes }) => ({
  components: { StatusButton },
  props: Object.keys(argTypes),
  template: `
    <div>
      <div style='display:grid;grid-template-columns:repeat(22,min-content);grid-gap:12px;'>
        <status-button type='annotate' />
        <status-button type='model' />
        <status-button type='review' />
        <status-button type='complete' />
        <status-button type='code' />
        <status-button type='dataset' />
        <status-button type='processing' />
        <status-button type='uploading' />
        <status-button type='new' />
        <status-button type='archived' />
        <status-button type='error' />

        <status-button type='annotate' variant='inverted' />
        <status-button type='model' variant='inverted' />
        <status-button type='review' variant='inverted' />
        <status-button type='complete' variant='inverted' />
        <status-button type='code' variant='inverted' />
        <status-button type='dataset' variant='inverted' />
        <status-button type='processing' variant='inverted' />
        <status-button type='uploading' variant='inverted' />
        <status-button type='new' variant='inverted' />
        <status-button type='archived' variant='inverted' />
        <status-button type='error' variant='inverted' />
      </div>
      <div style='display:grid;
                  grid-template-columns:repeat(22,min-content);
                  grid-gap:12px;margin-top:12px'>
        <status-button type='annotate' size='md' />
        <status-button type='model' size='md' />
        <status-button type='review' size='md' />
        <status-button type='complete' size='md' />
        <status-button type='code' size='md' />
        <status-button type='dataset' size='md' />
        <status-button type='processing' size='md' />
        <status-button type='uploading' size='md' />
        <status-button type='new' size='md' />
        <status-button type='archived' size='md' />
        <status-button type='error' size='md' />

        <status-button type='annotate' variant='inverted' size='md' />
        <status-button type='model' variant='inverted' size='md' />
        <status-button type='review' variant='inverted' size='md' />
        <status-button type='complete' variant='inverted' size='md' />
        <status-button type='code' variant='inverted' size='md' />
        <status-button type='dataset' variant='inverted' size='md' />
        <status-button type='processing' variant='inverted' size='md' />
        <status-button type='uploading' variant='inverted' size='md' />
        <status-button type='new' variant='inverted' size='md' />
        <status-button type='archived' variant='inverted' size='md' />
        <status-button type='error' variant='inverted' size='md' />
      </div>
    </div>
  `
})

Default.storyName = 'Collection'

export const Individual: Story<StatusButtonProps> = (args, { argTypes }) => ({
  components: { StatusButton },
  props: Object.keys(argTypes),
  template: `
    <status-button v-bind='$props' />
  `
})

Individual.args = {
  type: StageType.Complete,
  size: StatusButtonSize.MD,
  variant: StatusButtonVariant.INVERTED
}
