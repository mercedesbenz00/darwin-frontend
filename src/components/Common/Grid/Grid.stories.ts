import { Meta, Story } from '@storybook/vue'

import {
  Grid,
  GridItem,
  GridProps,
  SizeStep
} from './'

require('vue-virtual-scroller/dist/vue-virtual-scroller.css')

export default {
  title: 'Common/Grid',
  argTypes: {
    emptyMessage: {
      control: 'string',
      description: 'Message for empty grid',
      table: {
        type: { summary: 'String' },
        defaultValue: { summary: 'No data has been added yet' }
      }
    },
    allowInfiniteScroll: {
      control: 'boolean',
      description: 'Disables or enables infinite scroll',
      table: {
        type: { summary: 'Boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    sizeStep: {
      control: {
        type: 'radio',
        options: Object.entries(SizeStep).map((val) => val[1])
      }
    },
    totalCount: {
      control: 'number',
      description:
       'Total counts of grid items. It is necessary for infinite scroll. 0: no limit.',
      table: {
        type: { summary: 'Number' },
        defaultValue: { summary: '0' }
      }
    },
    skeletonCount: {
      control: 'number',
      description:
       'Skeleton count for loading status',
      table: {
        type: { summary: 'Number' },
        defaultValue: { summary: '0' }
      }
    },
    loading: {
      control: 'boolean',
      description: 'Disables or enables loading status',
      table: {
        type: { summary: 'Boolean' },
        defaultValue: { summary: 'false' }
      }
    }
  }
} as Meta<typeof Grid>

const Template: Story<GridProps> = (args) => ({
  components: { Grid },
  setup () {
    return { args }
  },
  methods: {
    onInfiniteScroll (): void {
      const appendItems = []
      for (let i = 1; i <= 10; i++) {
        appendItems.push({
          id: `${args.items.length + i}`,
          data: args.items.length + i
        })
      }
      args.items = args.items.concat(appendItems)
    }
  },
  template: `
    <div style="height:300px;">
      <grid v-bind="args" @infinite-scroll="onInfiniteScroll">
        <template #card="{ item }">
          <div style="width:100%;height:200px;background:hsla(212, 8%, 94%, 1);">
          </div>
        </template>

        <template #skeleton="{ item }">
          <div style="width:100%;height:200px;background:hsla(220, 17%, 91%, 1);">
          </div>
        </template>
      </grid>
    </div>
  `
})

export const DefaultStory = Template.bind({})

const generateItems = (n: number): GridItem[] => {
  const items = []
  for (let i = 1; i <= n; i++) {
    items.push({
      id: `${items.length + i}`,
      data: items.length + i
    })
  }
  return items
}

DefaultStory.storyName = 'virtual scroll'
DefaultStory.args = {
  sizeStep: SizeStep.md,
  items: generateItems(100)
}

export const inifiniteStory = Template.bind({})
inifiniteStory.storyName = 'infinite scroll'
inifiniteStory.args = {
  sizeStep: SizeStep.md,
  allowInfiniteScroll: true,
  items: generateItems(10),
  totalCount: 300
}

export const skeletonStory = Template.bind({})
skeletonStory.storyName = 'loading status with skeleton'
skeletonStory.args = {
  sizeStep: SizeStep.md,
  items: [],
  loading: true,
  skeletonCount: 10
}
