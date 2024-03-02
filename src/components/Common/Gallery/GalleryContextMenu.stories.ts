import { FolderIcon, StatusChangeIcon, RestoreIcon, TrashIconOld } from '@/assets/icons/V1'

import GalleryContextMenu from './GalleryContextMenu.vue'
import GalleryContextMenuCheckItem from './GalleryContextMenuCheckItem.vue'
import GalleryContextMenuItem from './GalleryContextMenuItem.vue'

const colors = require('@/assets/styles/darwin/variables/colors.module.scss')

export default {
  title: 'DatasetManagement'
}

export const GalleryContextMenus = () => ({
  components: {
    FolderIcon,
    GalleryContextMenu,
    GalleryContextMenuCheckItem,
    GalleryContextMenuItem,
    StatusChangeIcon,
    RestoreIcon,
    TrashIconOld
  },
  data () {
    return {
      colors,
      selected: false,
      style: {
        display: 'flex',
        'justify-content': 'center'
      }
    }
  },
  template: `
    <div :style="style">
      <gallery-context-menu>
        <gallery-context-menu-check-item
          style="min-width: 100px"
          :label="selected ? 'DESELECT' : 'SELECT'"
          :tooltip="selected ? 'Deselect' : 'Select'"
          :value="selected"
          @click="selected = !selected"
        />
        <gallery-context-menu-item color="pink" label="RESTORE 5">
          <restore-icon />
        </gallery-context-menu-item>
        <gallery-context-menu-item disabled="disabled" color="pink" label="DELETE 5">
          <trash-icon-old :color="colors.colorCrimsonLight" />
        </gallery-context-menu-item>
        <gallery-context-menu-item label="Status">
          <status-change-icon :color="colors.colorAliceNight" />
        </gallery-context-menu-item>
        <gallery-context-menu-item label="Folder">
          <folder-icon :color="colors.colorAliceNight" />
        </gallery-context-menu-item>
        <gallery-context-menu-item disabled="disabled" label="Disabled No Icon" />
      </gallery-context-menu>
    </div>
  `
})
