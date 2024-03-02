<template>
  <draggable
    v-bind="props"
    v-on="listeners"
  >
    <transition-group
      type="transition"
      :name="dragging ? null : 'flip-list'"
    >
      <slot />
    </transition-group>
  </draggable>
</template>

<script lang="ts">
/**
 * Wrapper component for vuedraggable with new animations
 *
 * This component accepts all the same props & listeners of vuedraggable.
 * https://github.com/SortableJS/Vue.Draggable
 */
import { Component, Vue } from 'vue-property-decorator'
import Draggable from 'vuedraggable'

@Component({
  name: 'animating-draggable',
  components: { Draggable }
})
export default class AnimatingDraggable extends Vue {
  dragging: boolean = false

  get props () {
    return {
      animation: 200,
      ghostClass: 'draggable-ghost',
      ...this.$attrs
    }
  }

  get listeners () {
    return {
      ...this.$listeners,
      start: () => {
        this.dragging = true
        const startListener = this.$listeners.start as Function
        startListener && startListener()
      },
      end: () => {
        this.dragging = false
        const endListener = this.$listeners.end as Function
        endListener && endListener()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.draggable-ghost {
  opacity: .1;
}

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}
</style>
