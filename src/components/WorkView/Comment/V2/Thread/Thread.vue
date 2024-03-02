<template>
  <section
    class="thread"
    :style="style"
  >
    <Chat />

    <ReasonsBox />

    <InputForm />

    <ThreadFooter :author-id="1" />
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import Chat from './Chat.vue'
import InputForm from './InputForm.vue'
import ReasonsBox from './ReasonsBox.vue'
import ThreadFooter from './ThreadFooter.vue'

export default defineComponent({
  name: 'Thread',
  components: {
    Chat,
    ReasonsBox,
    InputForm,
    ThreadFooter
  },
  setup () {
    const style = computed(() => ({
      left: '200px',
      top: '10px'
    }))

    return {
      style
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/uiKit/assets/index.scss';

$threadDefaultWidth: 260px;

.thread {
  position: absolute;
  z-index: var(--workview-comment-thread);
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  width: $threadDefaultWidth;
  max-height: 550px;
  overflow-y: auto;
  background-color: $colorNeutralsWhite;
  padding: $spacing-3;
  padding-bottom: 0;
  border: 1px solid $colorStrokeRaise;
  border-radius: $borderRadius12;
  box-shadow: $effectShadowsXS;

  display: grid;
  grid-template-rows: minmax(250px, 1fr) auto;
  gap: $spacing-4;
}
</style>
