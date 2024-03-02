<template>
  <button
    class="list-element"
    :data-selected="selected"
    :data-active="active"
    :disabled="disabled"
    tabindex="0"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div class="list-element__content">
      <div
        v-if="$slots.prefix"
        class="list-element__prefix-icon"
      >
        <slot name="prefix" />
      </div>
      <slot>
        <h2
          class="list-element__content__label"
          :class="{'list-element__label--disabled': disabled}"
        >
          {{ text }}
        </h2>
      </slot>
    </div>
    <div
      v-if="$slots.suffix"
      class="list-element-icon__suffix-icon"
    >
      <slot name="suffix" />
    </div>
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

/*
 * ListElementV2 - List Element from the new Design System
 * will be used in the several menus, options and modals.
 * accepts @ListElementV2Props
 *
 * You can place as many icons as you want next to the label by providing
 * the ListElementV2 one or more childs. The grid will automatically adjust the
 * size and spacing of the label and icons.
 * */
import { ListElementV2Props } from '@/components/Common/ListElements/ListElementV2/types'

@Component({ name: 'list-element-v2' })
export default class ListElementV2 extends Vue {
  @Prop({ required: false, type: String })
  text: ListElementV2Props['text']

  @Prop({ default: false, type: Boolean })
  selected!: ListElementV2Props['selected']

  @Prop({ default: false, type: Boolean })
  active!: ListElementV2Props['active']

  @Prop({ default: false, type: Boolean })
  disabled!: ListElementV2Props['disabled']
}
</script>

<style lang="scss" scoped>
.list-element {
  @include row--distributed;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 30px;
  background: transparent;
  border-radius: 8px;
  padding: 6px;
  margin: 0;
  outline: none;
  transition: background 125ms ease;

  &:disabled {
    cursor: not-allowed;

    .list-element__label {
      color: $colorNeutralsLight300;
    }
  }

  &:hover:not(:disabled) {
    background: $colorNeutralsLight100;
  }

  &:active:not(:disabled) {
    background: $colorNeutralsLight200;
  }

  &[data-selected='true'] {
    background: $colorSemanticLightAction100;

    &.list-element__label {
      color: $colorSemanticLightAction500;
    }
  }

  &[data-active='true'] {
    background-color: $colorOverlayInteractive;

    &.list-element__label {
      color: $colorSemanticLightAction500;
    }
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;

    &__label {
      @include typography(md-2, inter, 500);
      @include ellipsis(1, md-2);

      text-align: left;
      color: $colorContentDefault;

      width: fit-content;
    }
  }

  &__prefix-icon,
  &__suffix-icon {
    display: block;
    height: 20px;
    width: 20px;
    margin-right: 4px;
  }
}
</style>
