<template>
  <v-popover
    trigger="hover"
    placement="right"
    :open.sync="active"
    :popover-class="popoverClass"
  >
    <div
      class="info"
      :class="{ 'info--active': active }"
    >
      <info-icon />
    </div>
    <template #popover>
      <div class="info__hint">
        <div
          v-if="icon || title"
          class="info__hint__title"
        >
          <img
            v-if="!svgOverlayColor && icon"
            class="info__hint__icon"
            :src="icon"
          >
          <svg-overlay
            v-if="svgOverlayColor && icon"
            class="info__hint__icon"
            :url="icon"
            :color="svgOverlayColor"
          />
          <label class="info__hint__text">{{ title }}</label>
        </div>
        <div class="info__hint__content">
          <slot />
        </div>
      </div>
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { InfoIcon } from '@/assets/icons/V1'

import SvgOverlay from './SVGOverlay.vue'

@Component({
  name: 'info',
  components: { InfoIcon, SvgOverlay }
})
export default class Info extends Vue {
  @Prop({ required: false, default: null })
  icon!: string | null

  @Prop({ required: false, default: null })
  title!: string | null

  @Prop({ required: false, default: null })
  svgOverlayColor!: string | null

  @Prop({ required: false, type: String })
  popoverClass!: string | undefined

  active: boolean = false
}
</script>

<style lang="scss" scoped>
.info {
  @include info-icon;
}

.info__hint {
  border-radius: 10px;
  max-width: 300px;
}

.info__hint__title {
  @include row;
  @include typography(lg-1, headlines, 500);
  margin: auto 25px 8px auto;
  color: $colorWhite;
}

.info__hint__icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.info__hint__text {
  color: $colorWhite;
  margin: 0px;
  padding: 0px;
}

.info__hint__content {
  @include typography(md, default);
  line-height: 18px;
  margin-right: 15px;
  color: $colorSecondaryLight1;
}
</style>
