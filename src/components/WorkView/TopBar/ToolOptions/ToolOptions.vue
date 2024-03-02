<template>
  <div class="tool-options">
    <div
      v-for="option in options"
      :id="`tool-options__option__${option.id}`"
      :key="option.id"
      :class="{
        [`tool-options__option__${option.class}`]: option.class !== undefined,
        'tool-options__option': true,
        ['tool-options__option--active'] : option.active
      }"
    >
      <component
        :is="option.class || option.id"
        v-bind="option.props"
        v-tooltip="{ content: option.tooltip }"
        :editor="editor"
        @click.native="onClick(option)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { Editor } from '@/engine/editor'
import { ToolOption } from '@/engine/managers'

import Brush from './assets/brush.svg?inline'
import Eraser from './assets/eraser.svg?inline'
import Grow from './assets/grow.svg?inline'
import PolygonMerge from './assets/polygon_merge.svg?inline'
import PolygonSubtract from './assets/polygon_subtract.svg?inline'
import RestoreJoints from './assets/restore_joints.svg?inline'
import Round from './assets/round.svg?inline'
import Shrink from './assets/shrink.svg?inline'
import Squared from './assets/squared.svg?inline'
import BrushSize from './components/BrushSize.vue'
import Cols from './components/Cols.vue'
import Rows from './components/Rows.vue'
import Separator from './components/Separator.vue'

export default defineComponent({
  name: 'ToolOptions',
  components: {
    Brush,
    BrushSize,
    Cols,
    Eraser,
    Grow,
    polygon_subtract: PolygonSubtract,
    polygon_merge: PolygonMerge,
    restore_joints: RestoreJoints,
    Round,
    Rows,
    Separator,
    Shrink,
    Squared
  },
  props: {
    editor: { type: Object as () => Editor, required: true }
  },
  setup (props) {
    const options = computed<ToolOption[]>((): ToolOption[] => {
      const { currentTool } = props.editor.toolManager
      if (!currentTool) { return [] }
  
      const allOptions = currentTool.toolConfig.toolOptions
      if (!allOptions) { return [] }
  
      return allOptions.filter(option => option.isVisible(props.editor))
    }
    )

    const onClick = (option: ToolOption): void => {
      props.editor.callCommand(option.action)
    }

    return { onClick, options }
  }
})
</script>

<style lang="scss" scoped>
.tool-options {
  @include row;
  align-items: center;
}

.tool-options__option {
  @include col;
  justify-content: center;
  margin: 0 5px;
  width: 40px;
  height: 40px;
  border-radius: 3px;
  position: relative;
  cursor: pointer;

  &::after {
    content: ' ';
    position: absolute;
    left: 2px;
    right: 2px;
    bottom: -1px;
    height: 3px;
    border-radius: 2px;
    background: transparent;
  }

  &:not(.tool-options__option__number-field):hover {
    background: $colorSecondaryLight2;
  }

  &:focus {
    outline: none;
  }
}

.tool-options__option--active {
  &::after {
    background: $colorPrimaryLight;
  }
}

.tool-options__option svg {
  width: 100%;
  height: 100%;
  padding: 6px;
}

#tool-options__option__shrink {
  width: 20px;
  height: 26px;
  border: 1px solid $colorSecondaryLight1;
  border-left: none;
  border-radius: 0;
  margin: 0;

  &::after {
    display: none;
  }
}

#tool-options__option__grow {
  width: 20px;
  height: 26px;
  border: 1px solid $colorSecondaryLight1;
  border-left: none;
  border-radius: 0 3px 3px 0;
  margin: 0;

  &::after {
    display: none;
  }
}

#tool-options__option__restore_joints,
#tool-options__option__polygon_merge,
#tool-options__option__polygon_subtract {
  width: 40px;
  height: 40px;
  border-radius: 0 3px 3px 0;
  margin: 0 3px;
}

#tool-options__option__restore_joints {
  &::after {
    display: none;
  }
}

#tool-options__option__brush {
  margin-left: 0;
}

#tool-options__option__eraser {
  margin-right: 0;
}

#tool-options__option__brush-size {
  width: 50px;
  height: 26px;
  margin: 0;

  &::after {
    display: none;
  }
}

#tool-options__option__round {
  margin-left: 0;

  svg {
    overflow: visible;
  }
}

#tool-options__option__squared {
  margin-right: 0;
}

.tool-options__option__separator {
  border-left: 1px solid $colorSecondaryLight1;
  width: 0;
  margin: 0 10px;
  border-radius: 1px;

  &::after {
    display: none;
  }
}
</style>
