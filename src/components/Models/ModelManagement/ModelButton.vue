<template>
  <custom-button
    class="model-button"
    :class="{'model-button--with-hover': !!hoverText}"
    :color="color"
    size="medium"
    flair="rounded"
    variant="default"
    @click="$emit('click')"
  >
    <div class="model-button__text">
      {{ text }}
    </div>
    <div
      v-if="hoverText"
      class="model-button__text model-button__text--hover"
    >
      {{ hoverText }}
    </div>
  </custom-button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { CustomButton } from '@/components/Common/Button/V2'

@Component({
  name: 'model-button',
  components: { CustomButton }
})
export default class ModelButton extends Vue {
  @Prop({ required: false, type: String })
  color!: string

  @Prop({ required: true, type: String })
  text!: string

  @Prop({ required: false, type: String })
  hoverText!: string
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.model-button {
  width: 100%;
  display: grid;
  grid-template-columns: 10% minmax(min-content, 45%) minmax(min-content, 45%);
  column-gap: 20px;
  align-items: center;
  align-content: center;

  transition: all 0.2s ease;
}

.model-button:hover {
  filter: brightness(94%);
}

.model-button__icon {
  min-width: 0;
}

.model-button__text {
  @include typography(lg, inter, 500);
  justify-self: left;
  min-width: 0;
}

.model-button--with-hover {
  .model-button__text { display: inherit; }
  .model-button__text--hover { display: none; }
}

.model-button--with-hover:hover {
  .model-button__text { display: none; }
  .model-button__text--hover { display: inherit; }
}
</style>
