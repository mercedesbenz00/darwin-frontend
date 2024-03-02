<template>
  <li class="expansion-panel">
    <div
      v-if="$scopedSlots['header']"
      class="expansion-panel__header"
      @click="onToggle"
    >
      <slot
        name="header"
        :active="isActive"
      />

      <arrow-up-icon
        class="arrow-icon"
        :class="{ 'arrow-icon--down': !isActive }"
      />
    </div>

    <transition
      name="expansion-panel"
      @enter="onTransitionStart"
      @after-enter="onTransitionEnd"
      @before-leave="onTransitionStart"
      @after-leave="onTransitionEnd"
    >
      <div
        v-show="isActive"
        class="expansion-panel__content"
      >
        <slot name="content" />
      </div>
    </transition>
  </li>
</template>

<script lang="ts">
import { Component, InjectReactive, Vue, Prop, Watch } from 'vue-property-decorator'

import { ArrowUpIcon } from '@/assets/icons/V1'

import { ParentState } from './ExpansionPanels.vue'

@Component({
  name: 'expansion-panel',
  components: { ArrowUpIcon }
})
export default class ExpansionPanel extends Vue {
  @Prop({ required: true, type: String })
  id!: string

  @Prop({ type: Boolean, default: false })
  activeByDefault!: boolean

  @InjectReactive()
  Parent!: ParentState

  @Watch('id', { immediate: true })
  onId (): void {
    this.$set(this.Parent.active, this.id, this.activeByDefault)
  }

  get isActive (): boolean {
    return !!this.Parent.active[this.id]
  }

  onTransitionStart (el: HTMLElement): void {
    el.style.height = el.scrollHeight + 'px'
  }

  onTransitionEnd (el: HTMLElement): void {
    el.style.height = ''
  }

  onToggle (): void {
    this.$emit('click', this.id)

    if (this.isActive) {
      this.$delete(this.Parent.active, this.id)
    } else {
      this.$set(this.Parent.active, this.id, true)
    }
  }
}
</script>

<style lang="scss" scoped>
.expansion-panel {
  max-height: 100%;
}

.expansion-panel__header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding: calc($defaultSpace / 2);
  cursor: pointer;

  .arrow-icon {
    width: 11px;
    height: 10px;
    transition: transform .2s ease;

    &.arrow-icon--down {
      transform: rotate(180deg);
    }
  }
}

.expansion-panel__content {
  max-height: 100%;
  display: grid;
  grid-template-rows: 1fr;
}

.expansion-panel-enter-active,
.expansion-panel-leave-active {
  will-change: height, opacity;
  transition: height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}

.expansion-panel-enter,
.expansion-panel-leave-to {
  height: 0 !important;
  opacity: 0;
}
</style>
