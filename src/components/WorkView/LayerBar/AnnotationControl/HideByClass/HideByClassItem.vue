<template>
  <div
    class="hide-by-class-item"
    :class="{ 'hide-by-class-item--selected': selected }"
    @click="$emit('click')"
  >
    <type-icon-with-label
      class="hide-by-class-item__details"
      :type="classIconName"
      :color="classIconColor"
      :label="displayName"
    />
    <span class="hide-by-class-item__count">{{ count }}</span>
    <eye-closed-icon
      v-if="selected"
      class="hide-by-class-item__eye-icon"
    />
  </div>
</template>

<script lang="ts">
import { capitalize } from 'lodash'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import { EyeClosedIcon } from '@/assets/icons/V1'
import TypeIconWithLabel from '@/components/Common/AnnotationType/TypeIconWithLabel.vue'
import { AnnotationClassPayload, AnnotationTypePayload } from '@/store/types'

@Component({
  name: 'hide-by-class-item',
  components: { EyeClosedIcon, TypeIconWithLabel }
})
export default class HideByClassItem extends Vue {
  @Prop({ required: true })
  annotationClass!: AnnotationClassPayload

  @Prop({ required: true })
  count!: number

  @Prop({ default: false, type: Boolean })
  selected!: boolean

  @Getter('mainAnnotationTypeForClass', { namespace: 'aclass' })
  getMainAnnotationType!: (aClass: AnnotationClassPayload) => AnnotationTypePayload

  get classIconName (): string {
    const mainAnnotationType = this.getMainAnnotationType(this.annotationClass)
    return mainAnnotationType.name
  }

  get classIconColor (): string {
    return this.annotationClass.metadata._color
  }

  get displayName (): string {
    return capitalize(this.annotationClass.name)
  }
}
</script>

<style lang="scss" scoped>
.hide-by-class-item {
  display: grid;
  grid-template-columns: 1fr auto auto;

  align-items: center;
  justify-content: space-between;

  @include noSelect;
  border-radius: 13px;
  padding: 0 10px 0 5px;
  border: 1px solid transparent;
  transition: background-color .2s;
  cursor: pointer;

  &:hover {
    border: 1px solid $colorAliceBlue;
    background-color: $colorAliceShade;
    transition: none;
  }

  &:active {
    border: 1px solid $colorAliceShade;
    background-color: $colorAliceShade;
    transition: none;
  }
}

.hide-by-class-item--selected {
  border: 1px solid $colorAliceNight;
  background-color: $colorAliceShadow;

  &:hover, &:active {
    border: 1px solid $colorAliceNight;
    background-color: $colorAliceShadow;
  }
}

.hide-by-class-item__details {
  grid-column: 1 / 2;
}

.hide-by-class-item__icon {
  width: 23px;
  height: 23px;
  margin-right: 3px;
}

.hide-by-class-item__count {
  @include typography(sm, default, bold);
  color: $colorAliceNight;
  text-align: right;
}

.hide-by-class-item__eye-icon {
  margin: 0 5px;
  color: $colorAliceNight;
}
</style>
