<template>
  <div class="citation-info">
    <div class="citation-info__header">
      <div class="citation-quote-container">
        <icon-quote />
      </div>
      <h4 class="citation-info__title">
        Using V7 for academia? Cite us.
      </h4>
      <div class="citation-info__tips">
        Please add the citations below in your site and paper.
        Your dataset will also be public.
      </div>

      <custom-button
        size="medium"
        variant="outline"
        flair="rounded"
        @click="showPlans"
      >
        Show Plans
      </custom-button>
    </div>
    <div class="citation-info__main">
      <copy-block
        class="citation-info__command"
        label="Cite-V7"
        :content="citeV7Content"
      />
      <copy-block
        class="citation-info__command"
        label="Cite Dataset"
        :content="citeV7Dataset"
      />
      <copy-block
        class="citation-info__command"
        label="Public URL"
        :content="publicURL"
      />
      <span class="citation-info__tips">
        This public URL allows users to browse,
        and pull versions of your dataset for peer review.
      </span>
      <twitter-button
        class="btn-social__twitter"
        :url="publicURL"
        :description="twitterDescription"
        :is-blank="false"
        btn-text="Share this dataset"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { IconQuote } from '@/assets/icons/V2'
import { CustomButton } from '@/components/Common/Button/V2'
import CopyBlock from '@/components/Common/CopyBlock/CopyBlock.vue'
import TwitterButton from '@/components/Common/Social/TwitterButton.vue'
import { TeamPayload, DatasetPayload, RootState, UserPayload } from '@/store/types'

@Component({
  name: 'citation-info',
  components: { CopyBlock, CustomButton, IconQuote, TwitterButton }
})
export default class CitationInfo extends Vue {
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  @State(state => state.team.currentTeam)
  currentTeam!: TeamPayload

  @State((state: RootState) => state.user.profile)
  currentUser!: UserPayload

  expanded: boolean = false

  get citeV7Content (): string {
    return 'V7:V7.https://www.v7labs.com.'
  }

  get citeV7Dataset (): string {
    const { currentTeam, currentUser, dataset } = this

    if (this.isAuthorizedUser) {
      return `${currentTeam.name} (${new Date().getFullYear()}).${dataset.name}.
      ${currentUser.last_name} ${currentUser.first_name}, V7 Open Datasets. ${this.publicURL}`
    } else {
      return `(${new Date().getFullYear()}).${dataset.name}. V7 Open Datasets. ${this.publicURL}`
    }
  }

  get twitterDescription (): string {
    const { dataset } = this

    return `Check out ${dataset.name}, a new Open Source computer vision dataset: `
  }

  get publicURL (): string {
    const { currentTeam, dataset } = this
    return `https://darwin.v7labs.com/${currentTeam.slug}/${dataset.slug}`
  }

  get isAuthorizedUser (): boolean {
    return !!this.currentUser
  }

  showPlans () {
    const { name, params, query } = this.$route
    this.$router.push({
      name: name || undefined,
      params,
      query: { ...query, settings: 'plans' }
    })
  }
}
</script>

<style lang="scss" scoped>
.citation-info {
  @include col;
  width: 100%;
}

.citation-quote-container {
  @include row--center;
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  border-radius: 8px;
  background-color: $colorQuote;
}

.citation-info__header {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid $colorBorder;
}

.citation-info__title {
  @include typography(lg-1, inter, 500);
  margin-bottom: 2px;
  color: $colorContentDefault;
}

.citation-info__tips {
  @include typography(md-1, inter);
  margin-bottom: 12px;
  color: $colorContentSecondary;
}

.citation-info__main {
  margin-bottom: 12px;
}

.citation-info__command {
  flex: 1;
  border-radius: 3px;
  overflow: hidden;
  @include ellipsis(1, md);
  @include typography(md, inter);
  margin-top: 12px;
}

.citation-info__docs {
  @include row--center;
  height: 100%;
  @include typography(md-1, inter, bold);
  padding: 5px;
  margin-left: 10px;
  color: $color90Black;
  border: 1px solid $color90Black;
  border-radius: 2px;
}

.citation-info__extras {
  @include col;
}

.citation-info__command--extra:not(:last-child) {
  margin-bottom: 15px;
}

.btn-social__twitter {
  display: block;
  margin-top: 8px;
}
</style>
