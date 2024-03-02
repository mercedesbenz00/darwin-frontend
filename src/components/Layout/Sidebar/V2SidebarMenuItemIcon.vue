<template>
  <div
    v-tooltip="tooltipOptions"
    class="sidebar__menu__icon"
    :class="{
      'sidebar__menu__icon--active': active || hovered,
      'sidebar__menu__icon--disabled': !enabled
    }
    "
  >
    <component
      :is="normalTag"
      class="sidebar__menu__icon__normal"
    />
    <component
      :is="activeTag"
      class="sidebar__menu__icon__active"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import {
  IconDuotoneAddPerson,
  IconDuotoneAdmin,
  IconDuotoneComment,
  IconDuotoneDocument,
  IconDuotoneSettings,
  IconDuotoneStatusBeingAnnotated,
  IconDuotoneStatusDataset,
  IconDuotoneStatusModel,
  IconDuotoneTag,
  IconDuotoneVideo,
  IconDuotoneWorkflow
} from '@/assets/icons/V2/Duotone'
import {
  IconSelectedAddPerson,
  IconSelectedAdmin,
  IconSelectedBeingAnnotated,
  IconSelectedComment,
  IconSelectedDataset,
  IconSelectedDocument,
  IconSelectedModel,
  IconSelectedSettings,
  IconSelectedTag,
  IconSelectedVideo,
  IconSelectedWorkflow
} from '@/assets/icons/V2/Selected'
import { RootState } from '@/store/types'
import { TooltipOptions } from '@/types'

import { SidebarMenuItemIconName } from './types'

type IconIndex = {
  academy: string
  admin: string
  annotators: string
  classes: string
  datasets: string
  documentation: string
  feedback: string
  models: string
  'paper-plane': string
  settings: string
  workflows: string
}

@Component({
  name: 'v2-sidebar-menu-item-icon',
  components: {
    IconDuotoneAddPerson,
    IconDuotoneAdmin,
    IconDuotoneComment,
    IconDuotoneDocument,
    IconDuotoneSettings,
    IconDuotoneStatusBeingAnnotated,
    IconDuotoneStatusDataset,
    IconDuotoneStatusModel,
    IconDuotoneTag,
    IconDuotoneVideo,
    IconDuotoneWorkflow,
    IconSelectedAddPerson,
    IconSelectedAdmin,
    IconSelectedBeingAnnotated,
    IconSelectedComment,
    IconSelectedDataset,
    IconSelectedDocument,
    IconSelectedModel,
    IconSelectedSettings,
    IconSelectedTag,
    IconSelectedVideo,
    IconSelectedWorkflow
  }
})
export default class V2SidebarMenuItemIcon extends Vue {
  @Prop({
    required: false,
    default: true,
    type: Boolean as () => boolean
  })
  enabled!: boolean

  @Prop({ required: true })
  name!: SidebarMenuItemIconName

  @Prop({ required: true, type: String as () => string })
  tooltip!: string

  @Prop({ type: Boolean, default: false })
  active!: boolean

  @Prop({ type: Boolean, default: false })
  hovered!: boolean

  @State((state: RootState) => state.ui.sidebarMinimized)
  minimized!: boolean

  activeIconIndex: IconIndex = {
    academy: 'IconSelectedVideo',
    admin: 'IconSelectedAdmin',
    annotators: 'IconSelectedBeingAnnotated',
    classes: 'IconSelectedTag',
    datasets: 'IconSelectedDataset',
    documentation: 'IconSelectedDocument',
    feedback: 'IconSelectedComment',
    models: 'IconSelectedModel',
    'paper-plane': 'IconSelectedAddPerson',
    settings: 'IconSelectedSettings',
    workflows: 'IconSelectedWorkflow'
  }

  normalIconIndex: IconIndex = {
    academy: 'IconDuotoneVideo',
    admin: 'IconDuotoneAdmin',
    annotators: 'IconDuotoneStatusBeingAnnotated',
    classes: 'IconDuotoneTag',
    datasets: 'IconDuotoneStatusDataset',
    documentation: 'IconDuotoneDocument',
    feedback: 'IconDuotoneComment',
    models: 'IconDuotoneStatusModel',
    'paper-plane': 'IconDuotoneAddPerson',
    settings: 'IconDuotoneSettings',
    workflows: 'IconDuotoneWorkflow'
  }

  get activeTag (): string | undefined {
    const tag = Object.entries(this.activeIconIndex)
      .find(entry => entry[0] === this.name)

    return tag ? tag[1] : undefined
  }

  get normalTag (): string | undefined {
    const tag = Object.entries(this.normalIconIndex)
      .find(entry => entry[0] === this.name)

    return tag ? tag[1] : undefined
  }

  get tooltipOptions (): TooltipOptions {
    const { tooltip, minimized } = this
    return {
      content: tooltip,
      classes: minimized
        ? ['sidebar__menu__tooltip']
        : ['sidebar__menu__tooltip', 'sidebar__menu__tooltip--expanded'],
      placement: 'right',
      offset: 5
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar__menu__icon {
  position: relative;
  @include row--center;
  width: 20px;
  height: 20px;
}

.sidebar__menu__icon--disabled {
  svg {
    opacity: 0.5;
  }
}

.sidebar__menu__icon--active {
  .sidebar__menu__icon__normal {
    display: none;
  }
  .sidebar__menu__icon__active {
    display: block;
  }
}

.sidebar__menu__icon__normal {
  width: 100%;
  height: 100%;
}

.sidebar__menu__icon__active {
  width: 100%;
  height: 100%;
  display: none;
}
</style>
