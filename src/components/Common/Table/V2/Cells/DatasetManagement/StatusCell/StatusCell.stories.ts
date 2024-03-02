import { Meta, Story } from '@storybook/vue'

import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'

import StatusCell from './StatusCell.vue'
import { StatusCellProps } from './types'

export default {
  title: 'Common/Table/V2/Cells/StatusCell'
} as Meta<typeof StatusCell>

const Template: Story<StatusCellProps> = (args, { argTypes }) => ({
  components: { StatusCell },
  props: Object.keys(argTypes),
  template: `
    <status-cell v-bind='$props'>
      Label via slot
    </status-cell>
  `
})

export const Annotate = Template.bind({})
Annotate.args = {
  status: DatasetItemStatus.annotate,
  name: 'Louis Raetz',
  url: 'https://res.cloudinary.com/polygonxyz/image/upload/w_64,q_auto/polygon/logo-2.png'
}

export const Review = Template.bind({})
Review.args = {
  status: DatasetItemStatus.review,
  name: 'Louis Raetz',
  url: null
}

export const Complete = Template.bind({})
Complete.args = {
  status: DatasetItemStatus.complete,
  name: 'Louis Raetz',
  url: null
}

export const Default = Template.bind({})
Default.args = {
  status: DatasetItemStatus.annotate,
  name: 'Louis Raetz',
  url: null
}
