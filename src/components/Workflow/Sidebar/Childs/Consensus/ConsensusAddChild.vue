<template>
  <div class="stage-container">
    <button
      class="stage-wrapper"
      @click="$emit('click', type)"
    >
      <div class="stage-template-title">
        <component
          class="icon"
          :is="`${type}-stage-icon`"
        />
        {{ title }}
      </div>
      <div>
        <custom-button
          color="primary"
          flair="soft"
          size="very-small"
        >
          Add
        </custom-button>
      </div>
    </button>
  </div>
</template>

<script lang="ts">
import { capitalize } from 'lodash'
import {
  computed,
  defineComponent
} from 'vue'

import {
  IconColoredAnnotate as AnnotateStageIcon,
  IconColoredModel as ModelStageIcon
} from '@/assets/icons/V2/Colored'
import { CustomButton } from '@/components/Common/Button/V2'
import { StageType } from '@/store/types/StageType'

/**
 * @Component Foo
 */
export default defineComponent({
  name: 'ConsensusAddChild',
  components: {
    AnnotateStageIcon,
    CustomButton,
    ModelStageIcon
  },
  props: {
    type: {
      type: String as () => StageType,
      required: true
    }
  },
  setup (props) {
    const title = computed(() => capitalize(props.type))
    return {
      title,
      props
    }
  }
})
</script>

<style lang="scss" scoped>
.stage-container {
  position: relative;
  display: block;
  width: 100%;
  height: 52px;

  box-sizing: border-box;
  box-shadow: $shadowLightXXS;
  background: $colorNeutralsLightWhite;
  border: 1px solid $colorNeutralsLight300;
  border-radius: 8px;

  cursor: pointer;
}

.stage-template-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.stage-wrapper {
  transition: background 125ms ease;

  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: 8px;

  cursor: pointer;

  min-width: 212px;
  padding: 0 16px;

  @include typography(md-1, inter, 500);
  color: $colorNeutralsLight700;

  &:disabled {
    color: $colorNeutralsLight900;
    cursor: not-allowed;
  }
}

.icon {
  flex: 0 0 auto;
}
</style>
