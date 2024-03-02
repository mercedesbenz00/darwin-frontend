<template>
  <div>
    <h4 class="title">
      Leave a reply
    </h4>
    <div class="form">
      <TextArea
        class="form__textarea"
        value="Text"
        theme="light"
      />

      <div class="form__btn-group">
        <div>
          <DarwinButton
            class="form__btn"
            size="xs"
            kind="outline"
          >
            <IconAtSign />
          </DarwinButton>
          <DarwinButton
            class="form__btn"
            size="xs"
            kind="outline"
          >
            <IconFaceSmile />
          </DarwinButton>
        </div>

        <DarwinButton
          class="form__btn"
          size="xs"
          kind="primary"
        >
          <IconSend />
        </DarwinButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { IconAtSign, IconFaceSmile, IconSend } from '@/assets/icons/V2/Mono'
import TextArea from '@/components/Common/TextArea.vue'
import DarwinButton from '@/uiKit/Button/DarwinButton.vue'

export default defineComponent({
  name: 'InputForm',
  components: {
    TextArea,
    DarwinButton,
    IconAtSign,
    IconFaceSmile,
    IconSend
  }
})
</script>

<style lang="scss" scoped>
@import '@/uiKit/assets/index.scss';
$btnSize: 32px;

.title {
  @include typographyRegularBody25;
  color: $colorNeutralsLight500;
  margin-bottom: $spacing-2;
}

.form {
  &__textarea {
    :deep(textarea) {
      padding: $spacing-4;
      @include typographyRegularBody100;
    }
  }

  &__btn {
    padding: 5px;
    width: $btnSize;
    height: $btnSize;
    margin-right: $spacing-2;

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }

  &__btn-group {
    display: flex;
    justify-content: space-between;
    align-content: center;
  }
}
</style>
