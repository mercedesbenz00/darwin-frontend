<template>
  <div class="annotation-control">
    <v-popover
      placement="left-start"
      popover-class="tooltip--annotation-control"
      trigger="manual"
      :open.sync="open"
    >
      <button
        class="annotation-control__trigger"
        @click="open = true"
      >
        <dots-vertical />
      </button>
      <template #popover>
        <annotation-control-menu
          :readonly="readonly"
          @close="open = false"
        />
      </template>
    </v-popover>

    <delete-confirmation-dialog
      v-if="!readonly"
      button-text="DELETE"
      name="confirm-delete-visible-annotations"
      title="Delete All Visible Annotations"
      detail="Are you sure? This will remove all visible annotations present on this image."
      @confirmed="deleteAllVisibleAnnotations"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import DotsVertical from '@/assets/icons/V2/Mono/dots-vertical.vue'
import { DeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V1'

import AnnotationControlMenu from './AnnotationControlMenu.vue'

@Component({
  name: 'annotation-control',
  components: { AnnotationControlMenu, DeleteConfirmationDialog, DotsVertical }
})
export default class AnnotationControl extends Vue {
  @Prop({ required: false, default: false, type: Boolean })
  readonly!: boolean

  open: boolean = false

  async deleteAllVisibleAnnotations () {
    this.$modal.hide('confirm-delete-visible-annotations')
    await this.$store.dispatch('workview/deleteAllVisibleStageAnnotations')
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tooltip--annotation-control {
  @include dropdownBelow;
  border-radius: 3px;

  .tooltip-inner {
    background-color: $colorWhite;
    color: $colorSecondaryDark1;
    max-width: 250px;
    padding: 0;
    border-radius: 3px;
    overflow: hidden;
  }
}
</style>

<style lang="scss" scoped>
.annotation-control__trigger {
  @include row--center;
  background: transparent;
  position: relative;
  padding: 4px 5px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  transition: background .2s ease;

  &:hover {
    background: $colorAliceShade;
  }

  &:active {
    background: $colorAliceShadow;
  }
}
</style>
