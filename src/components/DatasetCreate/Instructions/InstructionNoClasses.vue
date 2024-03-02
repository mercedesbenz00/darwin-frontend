<template>
  <div class="instruction-no-classes">
    <div class="instruction-no-classes__img-container">
      <img
        src="/static/imgs/classes.png"
        class="instruction-no-classes__img"
      >
    </div>
    <custom-button
      v-if="isV2"
      color="primary"
      flair="rounded"
      @click="$emit('add')"
    >
      Create new class
    </custom-button>
    <primary-button
      v-else
      class="instruction-no-classes__button"
      @click="$emit('add')"
    >
      <circle-plus-icon />
      <label>CREATE NEW CLASS</label>
    </primary-button>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator'

import { CirclePlusIcon } from '@/assets/icons/V1'
import { CustomButton } from '@/components/Common/Button/V2'

@Component({ name: 'instruction-no-classes', components: { CirclePlusIcon, CustomButton } })
export default class InstructionNoClasses extends Vue {
  @Prop({ required: false, type: Boolean, default: false })
  isV2?: boolean
}
</script>

<style lang="scss" scoped>
.instruction-no-classes {
  width: 100%;
  @include col;
}

.instruction-no-classes__img-container {
  flex: 1;
  position: relative;
}

.instruction-no-classes__img {
  @include fullsize;
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.instruction-no-classes__button {
  @include row--center;
  width: 100%;
  z-index: 1;

  svg {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
}

</style>
