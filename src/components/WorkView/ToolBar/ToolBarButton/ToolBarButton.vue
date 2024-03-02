<template>
  <icon-button
    v-tooltip="tooltip"
    class="toolbar__button"
    :class="{ 'toolbar__button--active': active }"
    size="small"
    color="transparent"
    @click="$emit('click')"
  >
    <component
      :is="tag"
      :class="`toolbar-button-icon${ active ? '--active' : '' }`"
    />
  </icon-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { IconButton } from '@/components/Common/Button/V2'
import { ToolInfo } from '@/engine/managers/toolManager'
import { TooltipOptions } from '@/types'

import {
  BboxIcon,
  ActiveBboxIcon,
  BrushIcon,
  ActiveBrushIcon,
  CommentIcon,
  ActiveCommentIcon,
  CuboidIcon,
  ActiveCuboidIcon,
  DrawIcon,
  ActiveDrawIcon,
  EllipseIcon,
  ActiveEllipseIcon,
  FieldIcon,
  ActiveFieldIcon,
  KeypointIcon,
  ActiveKeypointIcon,
  LinkIcon,
  ActiveLinkIcon,
  MagicIcon,
  ActiveMagicIcon,
  MagnifierIcon,
  ActiveMagnifierIcon,
  PolylineIcon,
  ActivePolylineIcon,
  SelectIcon,
  ActiveSelectIcon,
  SkeletonIcon,
  ActiveSkeletonIcon,
  TableIcon,
  ActiveTableIcon
} from './assets/icons'

@Component({
  name: 'tool-bar-button',
  components: {
    IconButton,
    BboxIcon,
    BrushIcon,
    CommentIcon,
    CuboidIcon,
    DrawIcon,
    EllipseIcon,
    FieldIcon,
    KeypointIcon,
    LinkIcon,
    MagicIcon,
    MagnifierIcon,
    PolylineIcon,
    SelectIcon,
    SkeletonIcon,
    TableIcon,
    ActiveBboxIcon,
    ActiveBrushIcon,
    ActiveCommentIcon,
    ActiveCuboidIcon,
    ActiveDrawIcon,
    ActiveEllipseIcon,
    ActiveFieldIcon,
    ActiveKeypointIcon,
    ActiveLinkIcon,
    ActiveMagicIcon,
    ActiveMagnifierIcon,
    ActivePolylineIcon,
    ActiveSelectIcon,
    ActiveSkeletonIcon,
    ActiveTableIcon
  }
})
export default class ToolBarButton extends Vue {
  @Prop({ required: true, type: Object as () => ToolInfo })
  data!: ToolInfo

  get name (): string {
    return this.data.name
  }

  get icon (): string {
    return this.data?.icon
  }

  get active (): boolean {
    return this.data?.active
  }

  get tag (): string {
    return `${this.active ? 'active-' : ''}${this.icon}-icon`
  }

  get tooltip (): TooltipOptions {
    return {
      content: this.data?.toolTip || this.name,
      placement: 'right',
      delay: { show: 300, hide: 0 }
    }
  }
}
</script>
