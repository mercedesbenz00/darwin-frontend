<template>
  <div
    v-if="currentUser && !currentUser.tutorial_seen"
    class="tutorial-box"
  >
    <div
      class="tutorial-box__hide"
      @click="hide"
    >
      &#10005;
    </div>
    <div class="tutorial-box__info">
      <div class="tutorial-box__title">
        <annotate-icon />
        <span>Start the Annotation Tutorial</span>
      </div>
      <div class="tutorial-box__content">
        Learn the basics of image annotation, and how to use the various
        functionalities within Darwin through this 10 minute tutorial.
      </div>
      <div class="tutorial-box__actions">
        <secondary-button
          tag="a"
          href="https://www.v7labs.com/academy"
          target="_blank"
        >
          Visit the Academy
        </secondary-button>
        <primary-button
          tag="router-link"
          to="/tutorial"
        >
          Start Tutorial
        </primary-button>
      </div>
    </div>
    <confirmation-dialog
      name="hide-annotation-tutorial-box"
      title="Hide the Annotation Tutorial box?"
      :detail="confirmationContent"
      confirm-text="Hide"
      @confirmed="confirmHide"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import ConfirmationDialog from '@/components/Common/ConfirmationDialog.vue'
import { RootState, UserPayload } from '@/store/types'

import AnnotateIcon from './assets/annotate.svg?inline'

/**
 * The Annotation Tutorial box that will appear in the Dataset Management View, unless hidden
 */
@Component({
  name: 'annotation-tutorial-box',
  components: { AnnotateIcon, ConfirmationDialog }
})
export default class AnnotationTutorialBox extends Vue {
  @State((state: RootState) => state.user.profile)
  currentUser!: UserPayload

  get tutorialUrl (): string {
    return `${window.location.protocol}//${window.location.host}/tutorial`
  }

  hide () {
    this.$modal.show('hide-annotation-tutorial-box')
  }

  async confirmHide () {
    const { error } = await this.$store.dispatch('user/confirmTutorial')
    if (error) { this.$store.dispatch('toast/warning', { content: error.message }) }
  }

  get confirmationContent (): string {
    const anchor = `<a href='${this.tutorialUrl}'>${this.tutorialUrl}</a>`
    return `You will still be able to access the tutorial at ${anchor}`
  }
}
</script>

<style lang="scss" scoped>
.tutorial-box {
  @include col;
  position: relative;
  background-color: $colorAliceBlue;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0px 5px 20px rgba(145, 169, 192, 0.3);
}

.tutorial-box__hide {
  position: absolute;
  top: 20px;
  right: 20px;
  color: $colorAliceNight;

  &:hover {
    cursor: pointer;
  }
}

.tutorial-box__info {
  height: 100%;
  @include col;
}

.tutorial-box__title {
  @include row;
  align-items: center;
  margin-bottom: 8px;

  svg {
    margin-right: 10px;
  }
  span {
    @include typography(md-1, mulish, bold);
  }
}

.tutorial-box__content {
  flex: 1;
  @include typography(md, mulish);
  margin-bottom: 13px;
}

.tutorial-box__actions {
  @include row;
  align-items: center;
  justify-content: flex-end;

  & > * {
    margin-left: 16px;
  }
}
</style>
