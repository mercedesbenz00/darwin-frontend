<template>
  <component
    :is="tag"
    :to="route"
    class="workflow-card"
    :class="{ 'workflow-card--selected': selected }"
    @click="select"
  >
    <div class="workflow-card__upside">
      <thumbnails :data="thumbnails" />
    </div>
    <div class="workflow-card__details">
      <div class="workflow-card__details__row workflow-card__details__row__first">
        <div
          class="workflow-card__details__status"
          v-if="showActions"
        >
          <workflow-status :variant="status" />
        </div>
        <div
          v-if="!disableMenu"
          class="workflow-card__details__more"
        >
          <three-dot-button
            :disabled="false"
            @click="toggleMenu"
          />
        </div>
        <div
          v-if="menu"
          v-click-outside="hideMenu"
          class="workflow-card__details__menu"
        >
          <popup-menu>
            <list-element-v2
              text="Delete"
              @click="canArchive ? onDelete() : notifyCannotDelete()"
            />
          </popup-menu>
        </div>
      </div>
      <div class="workflow-card__details__row workflow-card__details__row__second">
        <div
          v-tooltip="{
            content: name,
            placement: 'top',
            delay: { show: 300 },
            classes: 'tooltip--workflow-card'
          }"
          class="workflow-card__details__name"
        >
          <header-3>
            {{ nameTruncated }}
          </header-3>
        </div>
      </div>
    </div>
    <div
      v-if="showActions"
      class="workflow-card__actions"
    >
      <custom-button
        color="primary"
        flair="soft"
        tag="router-link"
        :to="route"
        full-width
      >
        <span class="workflow-card__actions__content">
          <span class="label"> Open Workflow </span>
        </span>
      </custom-button>
    </div>
    <div class="workflow-card__downside">
      <workflow-stats :value="progress" />
    </div>
  </component>
</template>

<script lang="ts">
import { truncate } from 'lodash'
import { Component, Prop, Vue } from 'vue-property-decorator'

import { CustomButton } from '@/components/Common/Button/V2'
import Header3 from '@/components/Common/Header3.vue'
import ListElementV2 from '@/components/Common/ListElements/ListElementV2/ListElementV2.vue'
import PopupMenu from '@/components/Common/PopupMenu/V2/PopupMenu.vue'
import { ThreeDotButton } from '@/components/Common/ThreeDotButton'
import Thumbnails from '@/components/Common/Thumbnails/Thumbnails.vue'
import WorkflowStats from '@/components/Workflow/WorkflowStats.vue'
import { WorkflowStatus } from '@/components/Workflow/WorkflowStatus'
import { V2WorkflowPayload } from '@/store/types'
import { notifyErrorByCode } from '@/utils'

import { Progress } from './types'

@Component({
  name: 'workflow-card',
  components: {
    CustomButton,
    Header3,
    ListElementV2,
    PopupMenu,
    ThreeDotButton,
    Thumbnails,
    WorkflowStats,
    WorkflowStatus
  }
})
export default class WorkflowCard extends Vue {
  @Prop({ required: true })
  data!: V2WorkflowPayload

  @Prop({ default: false, type: Boolean })
  disableMenu!: boolean

  @Prop({ default: true, type: Boolean })
  showActions!: boolean

  @Prop({ default: false, type: Boolean })
  useLink!: boolean

  @Prop({ default: false, type: Boolean })
  selectable!: boolean

  @Prop({ default: false, type: Boolean })
  selected!: boolean

  menu: boolean = false
  get tag (): string {
    return this.useLink ? 'router-link' : 'div'
  }

  get canArchive (): boolean {
    return this.$can('archive_dataset', { subject: 'dataset', resource: this.data })
  }

  get thumbnails (): string[] {
    const { thumbnails } = this.data
    if (!thumbnails || thumbnails.length === 0) { return [] }
    return thumbnails
  }

  get nameTruncated (): string {
    const { name } = this.data
    return truncate(name, { length: 64 })
  }

  get status (): string {
    const { status } = this.data
    return status || 'inactive'
  }

  get name (): string {
    const { name } = this.data
    return name
  }

  get route (): string {
    return `/workflows/${this.data.id}`
  }

  get progress (): Progress {
    const { progress } = this.data
    return progress
  }

  toggleMenu (): void {
    this.menu = !this.menu
  }

  hideMenu (): void {
    this.menu = false
  }

  onDelete (): void {
    this.hideMenu()
    this.$emit('delete', this.data)
  }

  select (): void {
    if (!this.selectable) { return }
    this.$emit('click', this.data.id)
  }

  /**
   * "Delete" option in the dataset card dropdown is clickable
   * even when the user is not allowed to delete the dataset
   * and the appearance is that of a disabled control, but
   * instead of performing a backend request, it just notifies
   * why the user cannot delete the dataset.
   */
  notifyCannotDelete (): void {
    this.hideMenu()
    notifyErrorByCode(this.$store, 'DATASET_DELETE_NOT_AUTHORIZED')
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tooltip--workflow-card {
  &[x-placement^='top'] {
    margin-bottom: 7px;
  }
}
</style>

<style lang="scss" scoped>
.workflow-card {
  @include col;
  display: inline-flex;
  flex: 1 1 auto;
  min-width: 240px !important;
  width: 240px !important;
  padding: 6px;
  background: $colorWhite;
  border-radius: 12px;
  border: 2px solid $colorStrokeRaise;
  position: relative;
  cursor: pointer;

  &--selected {
    border-color: $colorInteractivePrimaryDefault;
  }

  &__upside {
    width: 100%;
    height: inherit;
    border-radius: 12px 12px 0 0;
    position: relative;
  }

  &__details {
    position: relative;
    @include typography(md, inter);
    align-items: center;
    padding: 8px 0 0;
    line-height: 20px;

    &__row {
      position: relative;
      @include row--distributed;
    }

    &__status {
      @include row;
      width: 100%;
    }

    &__more {
      @include row--center;
    }

    &__menu {
      position: absolute;
      @include col;
      top: 36px;
      right: -60px;
      z-index: 1000;

      // eslint-disable-next-line vue-scoped-css/no-unused-selector
      .menu__container {
        background: $colorWhite;
      }
    }

    &__name {
      @include ellipsis;
      height: 100%;
      white-space: nowrap;

      h3 {
        @include ellipsis;
        @include typographyRegularBody300;
        word-break: break-all;
        text-decoration: none;
        align-items: center;
        text-align: justify;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 500 !important;
        color: $colorContentDefault;
      }
    }
  }

  &__actions {
    @include row--center;
    padding: 8px 0 0;
    @include typography(md, inter);
    line-height: 20px;

    &__content {
      @include row--center;

      .label {
        text-transform: capitalize;
      }
    }
  }

  &__downside {
    flex: 1;
    padding-top: 8px;
    position: relative;
    overflow: hidden;
  }
}
</style>
