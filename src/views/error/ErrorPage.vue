<template>
  <background>
    <div class="auth header">
      <logo />
    </div>
    <div class="center__content">
      <div class="error__modal">
        <div class="error__modal__title">
          Something went wrong
        </div>
        <div class="error__modal__text">
          You weren't supposed to end up here. Something must have gone wrong.
        </div>
        <div class="error__modal__text">
          You can contact support if you think it's a bug.
        </div>
        <div class="error__modal__button__center">
          <positive-button
            tag="a"
            href="mailto:support@v7labs.com"
            target="_blank"
          >
            Contact support
          </positive-button>
        </div>
      </div>
    </div>
  </background>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Background from '@/components/Common/Background.vue'
import Logo from '@/components/Common/Logo.vue'

export default defineComponent({
  name: 'ErrorPage',
  components: { Background, Logo }
})
</script>

<style scoped lang="scss">
.error__modal {
  height: 380px;
  width: 520px;
  margin-top: 50px;
  margin-bottom: 40px;
  border-radius: 10px;
  background-color: $colorWhite;
  box-shadow: 0px 10px 60px rgba(11, 36, 72, 0.1), 0px 1px 2px rgba(11, 36, 72, 0.05);
}

.error__modal__title {
  margin: 50px 50px 25px 70px;
  @include typography(lg, default, bold);
  text-align: left;
  letter-spacing: 0.01em;
  color: $colorSecondaryDark1;
}

.error__modal__text {
  padding: 25px 50px 25px 70px;
}

.error__modal__button__center {
  @include row--center;
}
</style>
