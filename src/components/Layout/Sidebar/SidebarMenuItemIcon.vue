<template>
  <div
    v-tooltip="tooltipOptions"
    class="sidebar__menu__icon"
    :class="{ 'sidebar__menu__icon--active': active }"
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
  AcademyIcon,
  AnnotatorsIcon,
  ClassesIcon,
  DatasetsIcon,
  DataStreamsIcon,
  DocumentationIcon,
  FeedbackIcon,
  ModelsIcon,
  OpenDatasetsIcon,
  PaperPlaneIcon,
  PluginsIcon,
  SettingsIcon,
  WorkflowsIcon,
  ActiveAcademyIcon,
  ActiveAnnotatorsIcon,
  ActiveClassesIcon,
  ActiveDatasetsIcon,
  ActiveDataStreamsIcon,
  ActiveDocumentationIcon,
  ActiveFeedbackIcon,
  ActiveModelsIcon,
  ActiveOpenDatasetsIcon,
  ActivePaperPlaneIcon,
  ActivePluginsIcon,
  ActiveSettingsIcon,
  ActiveWorkflowsIcon
} from '@/assets/icons/V1/sidebar'
import { RootState } from '@/store/types'
import { TooltipOptions } from '@/types'

import { SidebarMenuItemIconName } from './types'

@Component({
  name: 'sidebar-menu-item-icon',
  components: {
    AcademyIcon,
    AnnotatorsIcon,
    ClassesIcon,
    DatasetsIcon,
    DataStreamsIcon,
    DocumentationIcon,
    FeedbackIcon,
    ModelsIcon,
    OpenDatasetsIcon,
    PaperPlaneIcon,
    PluginsIcon,
    SettingsIcon,
    WorkflowsIcon,
    ActiveAcademyIcon,
    ActiveAnnotatorsIcon,
    ActiveClassesIcon,
    ActiveDatasetsIcon,
    ActiveDataStreamsIcon,
    ActiveDocumentationIcon,
    ActiveFeedbackIcon,
    ActiveModelsIcon,
    ActiveOpenDatasetsIcon,
    ActivePaperPlaneIcon,
    ActivePluginsIcon,
    ActiveSettingsIcon,
    ActiveWorkflowsIcon
  }
})
export default class SidebarMenuItemIcon extends Vue {
  @Prop({ required: true })
  name!: SidebarMenuItemIconName

  @Prop({ required: true, type: String as () => string })
  tooltip!: string

  @Prop({ type: Boolean, default: false })
  active!: boolean

  @State((state: RootState) => state.ui.sidebarMinimized)
  minimized!: boolean

  get activeTag (): string {
    return `active-${this.name}-icon`
  }

  get normalTag (): string {
    return `${this.name}-icon`
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
  margin-left: 2px;
  position: relative;
  @include row--center;
  width: 25px;
  height: 25px;
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
