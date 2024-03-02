import Vue from 'vue'

import { installCommonComponents } from '@/plugins/components'
import { slider } from '@/storybook/controls/slider'

import ModalContainer from './ModalContainer.vue'
import ModalContent from './ModalContent.vue'
import ModalFooter from './ModalFooter.vue'
import ModalHeader from './ModalHeader.vue'
import ModalHeaderTitle from './ModalHeaderTitle.vue'

installCommonComponents(Vue)
const stories = {
  title: 'Common',
  argTypes: {
    width: slider(200, 1000)
  }
}

export default stories

type Args = Record<keyof typeof stories.argTypes, any>

export const ModalLayout = (args: Args, { argTypes }: any) => Vue.extend({
  components: {
    ModalContainer,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalHeaderTitle
  },
  props: Object.keys(argTypes),
  computed: {
    style () {
      return { width: `${this.width}px` }
    }
  },
  template: `
    <modal-container :style="style">
      <modal-header>
        <template #title>
          <modal-header-title>Modal Title</modal-header-title>
        </template>
      </modal-header>
      <modal-content>
        <h3>Modal Content</h3>
        <p>Content paragraph</p>
      </modal-content>
      <modal-footer>
        <positive-button>Okay</positive-button>
      </modal-footer>
    </modal-container>
  `
})

ModalLayout.argTypes = { ...stories.argTypes }

ModalLayout.args = {
  width: 450
}
