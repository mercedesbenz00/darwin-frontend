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
import { computed, defineComponent } from 'vue'

import { IconButton } from '@/components/Common/Button/V2'
import {
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
  ActiveTableIcon,
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
  TableIcon
} from '@/components/WorkView/ToolBar/ToolBarButton/assets/icons'
import { ToolInfo } from '@/engineV2/managers/toolManager'
import { TooltipOptions } from '@/types'

export default defineComponent({
  name: 'ToolBarButton',
  components: {
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
    ActiveTableIcon,
    BboxIcon,
    BrushIcon,
    CommentIcon,
    CuboidIcon,
    DrawIcon,
    EllipseIcon,
    FieldIcon,
    IconButton,
    KeypointIcon,
    LinkIcon,
    MagicIcon,
    MagnifierIcon,
    PolylineIcon,
    SelectIcon,
    SkeletonIcon,
    TableIcon
  },

  props: {
    active: {
      required: false,
      type: Boolean,
      default: false
    },
    data: {
      required: true,
      type: Object as () => ToolInfo
    }
  },

  setup (props) {
    const icon = computed<string>(() => props.data.icon)
    const name = computed<string>(() => props.data.name)
    const tag = computed<string>(() =>
      `${props.active ? 'active-' : ''}${icon.value}-icon`
    )

    const tooltip = computed<TooltipOptions>(() => {
      return {
        content: props.data.toolTip || name.value,
        placement: 'right',
        delay: { show: 300, hide: 0 }
      }
    })

    return {
      icon,
      name,
      tag,
      tooltip
    }
  }
})
</script>
