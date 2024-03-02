import { Story } from '@storybook/vue'
import RouteMock from 'storybook-vue-router'

import store from '@/store'
import { setupMultiple } from '@/storybook/fixtures/__mocks__/workflow/setupMultiple'
import { getElement } from '@/utils/getElement'

import ShowView from './ShowView.vue'

const stories = {
  title: 'Scenes/Workflow',
  argTypes: {
    stages: { control: 'object' },
    sidebarStages: { control: 'object' }
  },
  decorators: [RouteMock()]
}

export default stories

export const Empty: Story = () => ({
  components: { ShowView },
  template: `
    <div style='width: 100%;height: calc(100vh - 32px);display: block'>
      <index-view v-bind='$props' />
    </div>
  `,
  store,
  mounted (): void {
    setupMultiple()
  },
  beforeDestroy (): void {
    const el = getElement('leader-line-defs')
    const el2 = getElement('leader-line')

    if (el && el2) {
      el.remove()
      const arr: HTMLElement[] = [].slice.call(el2)
      arr.forEach((el) => {
        el.remove()
      })
    }
  }
})
Empty.storyName = 'Playground'
