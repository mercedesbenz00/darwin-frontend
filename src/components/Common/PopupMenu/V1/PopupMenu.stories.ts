import { CopyIcon } from '@/assets/icons/V1'

import PopupMenu from './PopupMenu.vue'
import PopupMenuItem from './PopupMenuItem.vue'

const colors = require('@/assets/styles/darwin/variables/colors.module.scss')

const stories = {
  title: 'Common/PopupMenu/Versions/V1/PopupMenu',
  component: PopupMenu
}

export default stories

export const Standard = () => ({
  components: { CopyIcon, PopupMenu, PopupMenuItem },
  data () {
    return { colors }
  },
  template: `
    <popup-menu>
      <popup-menu-item>Standard item</popup-menu-item>
      <popup-menu-item>
        <template #icon>
          <copy-icon :color="colors.color90Black" />
        </template>

        Standard item
      </popup-menu-item>
      <popup-menu-item disabled>Standard disabled</popup-menu-item>
      <popup-menu-item theme="crimson">Crimson Item</popup-menu-item>
      <popup-menu-item disabled>Crimson disabled</popup-menu-item>
    </popup-menu>
  `
})
