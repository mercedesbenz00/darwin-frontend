<template>
  <div class="chat-wrapper">
    <div class="chat">
      <Message
        :author-id="1"
        class="chat__message"
      />
      <Message
        :author-id="1"
        class="chat__message"
      />
      <Message
        :author-id="1"
        class="chat__message"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Message from './Message.vue'

export default defineComponent({
  name: 'Chat',
  components: { Message }
})
</script>

<style lang="scss" scoped>
@import '@/uiKit/assets/index.scss';

$barWidth: 3px;

.chat-wrapper, .chat {
  width: 100%;
  height: 100%;
}

.chat {
  padding-right: 5px + $barWidth;

  @include scrollbarV2('vertical', $barWidth);

  &__message {
    margin-bottom: $spacing-2;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
