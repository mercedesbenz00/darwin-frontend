import { CopyIcon } from '@/assets/icons/V1'

import PopupMenuItem from './PopupMenuItem.vue'

const colors = require('@/assets/styles/darwin/variables/colors.module.scss')

const stories = {
  title: 'Common/PopupMenu/Versions/V1/PopupMenuItem',
  component: PopupMenuItem
}

export default stories

export const Standard = () => ({
  components: { PopupMenuItem },
  template: `
    <div style="width: 120px">
      <popup-menu-item>Standard item</popup-menu-item>
    </div>
  `
})

export const StandardWithIcon = () => ({
  components: { CopyIcon, PopupMenuItem },
  data () {
    return { colors }
  },
  template: `
    <div style="width: 180px">
      <popup-menu-item>
        <template #icon>
          <copy-icon :color="colors.color90Black" />
        </template>

        Standard item
      </popup-menu-item>
    </div>
  `
})

export const StandardDisabled = () => ({
  components: { PopupMenuItem },
  template: `
    <div style="width: 120px">
      <popup-menu-item disabled>Standard disabled</popup-menu-item>
    </div>
  `
})

export const Crimson = () => ({
  components: { PopupMenuItem },
  template: `
    <div style="width: 120px">
      <popup-menu-item theme="crimson">Crimson Item</popup-menu-item>
    </div>
  `
})

export const CrimsonDisabled = () => ({
  components: { PopupMenuItem },
  template: `
    <div style="width: 120px">
      <popup-menu-item disabled>Crimson disabled</popup-menu-item>
    </div>
  `
})
