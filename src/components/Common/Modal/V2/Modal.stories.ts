import Vue from 'vue'

import { DialogSize } from '@/components/Common/Modal/V2/types'
import { installCommonComponents } from '@/plugins/components'
import { slider } from '@/storybook/controls/slider'

import ModalV2 from './Modal.vue'
import ModalContentV2 from './ModalContent.vue'
import ModalFooterV2 from './ModalFooter.vue'
import ModalHeaderV2 from './ModalHeader.vue'
import ModalHeaderTitleV2 from './ModalHeaderTitle.vue'

installCommonComponents(Vue)
const stories = {
  title: 'Common/Modal/V2',
  argTypes: {
    width: slider(200, 1000)
  },
  size: {
    control: {
      type: 'select',
      options: Object.entries(DialogSize).map((val) => val[1])
    },
    description: 'Changes Dialog size. Choose between - SMALL | MEDIUM | LARGE',
    table: {
      type: { summary: 'DialogSize' },
      defaultValue: { summary: 'DialogSize.SMALL' }
    }
  }
}

export default stories

type Args = Record<keyof typeof stories.argTypes, any>

export const ModalLayout = (args: Args, { argTypes }: any) => Vue.extend({
  components: {
    ModalV2,
    ModalContentV2,
    ModalFooterV2,
    ModalHeaderV2,
    ModalHeaderTitleV2
  },
  props: Object.keys(argTypes),
  computed: {
    style () {
      return { width: `${this.width}px` }
    }
  },
  template: `
    <modal-v2 :style="style" height="500px">
      <modal-header-v2>
        <template #title>
          <modal-header-title-v2>Modal Title</modal-header-title-v2>
        </template>
      </modal-header-v2>
      <modal-content-v2>
        <h3>Modal Content</h3>
        <p>Content paragraph</p>
      </modal-content-v2>
      <modal-footer-v2>
        <positive-button>Okay</positive-button>
      </modal-footer-v2>
    </modal-v2>
  `
})

ModalLayout.argTypes = { ...stories.argTypes }

ModalLayout.args = {
  width: 450
}
