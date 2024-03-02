<template>
  <v2-dataset-detail-layout
    :dataset="dataset"
    parent-type="dataset"
    :parent-location="parentLocation"
  >
    <template #content>
      <class-loader />
      <div class="dataset-classes">
        <div class="dataset-classes__main">
          <div class="dataset-classes__header">
            <div class="dataset-classes__search">
              <search-field
                v-model="search"
                class="dataset-classes__search-input"
                placeholder="Search for classes..."
                @change="onSearch"
              />
            </div>
          </div>
          <div
            v-loading="loading"
            :loading-options="{
              label: 'Fetching Classes',
              backgroundColor: $theme.getColor('colorSecondaryLight3'),
              minTimeout: 0
            }"
            class="dataset-classes__gallery"
          >
            <classes-gallery-with-separator
              ref="galleryRef"
              :classes="[datasetClasses, nonDatasetClasses]"
              :empty-message="errorMessage"
              :dataset="dataset"
              @edit="onEditClass"
              @scroll-above-separator="clearHash"
            >
              <template #separator>
                <button
                  type="button"
                  class="dataset-classes__second-gallery-title"
                  @click="scrollToTeamClasses"
                >
                  Add more classes
                </button>
              </template>
            </classes-gallery-with-separator>
          </div>
          <classes-context-menu
            :classes="datasetClasses"
          />
        </div>
        <annotation-class-dialog
          ref="classDialog"
          :annotation-classes="datasetClasses"
          :dataset="dataset"
          :team="currentTeam"
          @update="updatedClass"
        />
      </div>
    </template>
    <template #sidebar>
      <classes-sidebar
        :dataset="dataset"
        @create="onCreateClass"
      />
    </template>
  </v2-dataset-detail-layout>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Location, Route } from 'vue-router'
import { Getter, State } from 'vuex-class'

import AnnotationClassDialog from '@/components/Classes/AnnotationClassDialog/AnnotationClassDialog.vue'
import ClassesContextMenu from '@/components/Classes/ClassesContextMenu.vue'
import ClassesSidebar from '@/components/Classes/Sidebar/Sidebar.vue'
import SearchField from '@/components/Common/SearchField.vue'
import ClassesGalleryWithSeparator from '@/components/Dataset/DatasetDetail/ClassesGalleryWithSeparator.vue'
import V2DatasetDetailLayout from '@/components/Dataset/DatasetDetail/V2DatasetDetailLayout.vue'
import ClassLoader from '@/components/Renderless/ClassLoader'
import {
  AnnotationClassPayload,
  AnnotationTypePayload,
  DatasetPayload,
  LoadingStatus,
  RootState,
  TeamPayload
} from '@/store/types'
import {
  getDatasetClasses,
  getNonDatasetClasses,
  ParsedError
} from '@/utils'

@Component({
  name: 'dataset-classes-v2',
  components: {
    AnnotationClassDialog,
    ClassesContextMenu,
    ClassesGalleryWithSeparator,
    ClassesSidebar,
    ClassLoader,
    SearchField,
    V2DatasetDetailLayout
  }
})
export default class DatasetClassesV2 extends Vue {
  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload

  @State((state: RootState) => state.aclass.types)
  annotationTypes!: AnnotationTypePayload[]

  @State((state: RootState) => state.aclass.classSelected)
  classSelected!: { [key: number]: boolean }

  @Getter('filteredClasses', { namespace: 'aclass' })
  classes!: AnnotationClassPayload[]

  @State((state: RootState) => state.aclass.classesLoadingStatus)
  classesLoadingStatus!: LoadingStatus

  get loading (): boolean {
    return [LoadingStatus.Unloaded, LoadingStatus.Loading].includes(this.classesLoadingStatus)
  }

  /**
   * Return 'No classes have been added yet'
   * if both classes arrays are empty
   */
  get errorMessage (): string {
    if (!this.datasetClasses.length && !this.nonDatasetClasses.length) {
      return 'No classes to show'
    }

    return 'No classes have been added yet'
  }

  search: string = ''

  $refs!: {
    classDialog?: AnnotationClassDialog
    galleryRef?: Vue & ClassesGalleryWithSeparator
  }

  readonly LoadingStatus = LoadingStatus

  get parentLocation (): Location {
    return { path: '/datasets', query: this.$route.query }
  }

  get datasetClasses () {
    return getDatasetClasses(this.classes, this.dataset.id)
  }

  get nonDatasetClasses () {
    return getNonDatasetClasses(this.classes, this.dataset.id)
  }

  get hash () {
    return this.$route.hash
  }

  @Watch('hash', { immediate: true })
  onHash (): void {
    if (this.hash === '#team-classes') {
      this.scrollToTeamClasses()
    }
  }

  beforeRouteEnter (to: Route, from: Route, next: Function) {
    /*
      If there are a lot of classes, the UI gets blocked while they
      are mounted, instead we first unload them so navigation is fast
      and the load them on the actual page.
      A better solution would be to virtual scrolling on the class page.
    */
    return next((vm: DatasetClassesV2) => {
      vm.$store.commit('aclass/SET_CLASSES', [])
      return next()
    })
  }

  mounted (): void {
    if (this.$route.hash === '#new') { this.onCreateClass() }
    this.$on('hook:beforeDestroy', () => {
      this.$store.commit('aclass/SET_SEARCH_TEXT', '')
    })
  }

  onSearch (): void {
    this.$store.commit('aclass/SET_SEARCH_TEXT', this.search)
  }

  onCreateClass (): void {
    this.openClassDialog()
  }

  onEditClass (annotationClass: AnnotationClassPayload) {
    this.openClassDialog(annotationClass)
  }

  openClassDialog (annotationClass?: AnnotationClassPayload) {
    const { classDialog } = this.$refs
    if (!classDialog) { return }
    classDialog.show(annotationClass)
  }

  updatedClass (params: { data?: AnnotationClassPayload, error?: ParsedError }) {
    const { data, error } = params
    if (error) { return }

    this.$store.commit('aclass/PUSH_CLASS', data)
  }

  /**
   * Happens when we want to scroll down to team classes, i.e. when the user
   * clicks the team classes header, or the hash is in some other way set to
   * that location.
   */
  scrollToTeamClasses (): void {
    if (!this.$refs.galleryRef) {
      setTimeout(() => { this.scrollToTeamClasses() }, 500)
      return
    }

    this.$refs.galleryRef.scrollToSeparator()
  }

  clearHash (): void {
    const { path, params, query, hash } = this.$route
    if (hash === '#team-classes') {
      this.$router.replace({ path, params, query })
    }
  }
}
</script>

<style lang="scss" scoped>
.dataset-classes {
  @include row;
  width: 100%;
  height: 100%;
}

.dataset-classes__main {
  flex: 1 1 auto;
  @include col;
  align-items: center;
  height: 100%;
  position: relative;
  z-index: 2;
  overflow: hidden;
}

// Dataset Management Header
.dataset-classes__header {
  @include row--distributed;
  margin: 25px 50px 0 50px;
  width: calc(100% - 100px);
  height: 40px;
}

.dataset-classes__search {
  width: 100%;
  border-radius: 5px;
  cursor: pointer;
}

.dataset-classes__gallery {
  flex: 1 1 auto;
  width: 100%;
  // 65px = 40px(.dataset-classes__header height) + 25px(.dataset-classes__header margin-top)
  min-height: 100px;
  padding: 10px 0 0 0;
  overflow-y: auto;
}

.dataset-classes__second-gallery-title {
  position: sticky;
  bottom: 0;
  width: 100%;
  padding: 10px 50px;
  margin-bottom: 10px;
  display: block;
  text-align: left;

  background: $colorAliceBlue;
  border-top: 1px solid $colorAliceShadow;

  @include typography(lg-1, inter, bold);
  color: $color90Black;
}
</style>
