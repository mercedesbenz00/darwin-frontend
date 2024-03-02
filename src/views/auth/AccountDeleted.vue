<template>
  <background>
    <div class="auth header">
      <logo />
    </div>
    <div class="center__content">
      <div class="account-deleted__modal">
        <div class="account-deleted__modal__title">
          Your account has been deleted
        </div>
        <div class="account-deleted__modal__text">
          It looks like your account has been deleted. If this was a mistake,
          you'll have to contact us by email so we can restore it.
        </div>
        <div class="account-deleted__modal__button__center">
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
  name: 'AccountDeleted',
  components: { Background, Logo }
})
</script>

<style lang="scss" scoped>
.account-deleted__modal {
  width: 520px;
  height: 380px;
  margin-top: 50px;
  margin-bottom: 40px;
  background-color: $colorWhite;
  border-radius: 10px;
  box-shadow: 0px 10px 60px rgba(11, 36, 72, 0.1), 0px 1px 2px rgba(11, 36, 72, 0.05);
}

.account-deleted__modal__title {
  @include typography(lg, default, bold);
  margin: 50px 50px 25px 70px;
  text-align: left;
  letter-spacing: 0.01em;
  color: $colorSecondaryDark1;
}

.account-deleted__modal__text {
  margin: 25px 50px 25px 70px;
}

.account-deleted__modal__button__center {
  @include row--center;
}
</style>
