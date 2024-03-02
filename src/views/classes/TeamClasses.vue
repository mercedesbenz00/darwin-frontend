<template>
  <div class="classes">
    <class-loader />
    <div class="classes__main">
      <div class="classes__header">
        <h1 class="classes__title">
          Classes
        </h1>
        <div class="classes__header__search">
          <search-field
            v-model="search"
            class="classes__header__search__field"
            placeholder="Search for classes..."
            @change="onSearch"
          />
        </div>
      </div>
      <div
        v-loading="loading"
        :loading-options="{
          label: 'Fetching Classes',
          backgroundColor: $theme.getColor('colorSecondaryLight3')
        }"
        class="classes__tab__content"
      >
        <classes-gallery
          :classes="classes"
          :empty-message="search ? 'No classes to show' : 'No classes have been added yet'"
          :loading="loading"
          @edit="onEditClass"
        />
        <classes-context-menu :classes="classes" />
      </div>
    </div>
    <annotation-class-dialog
      ref="classDialog"
      :annotation-classes="classes"
      :dataset="dataset"
      :team="currentTeam"
      @update="updatedClass"
    />
    <div class="classes__sidebar-container">
      <classes-sidebar
        :dataset="dataset"
        :loading="loading"
        @create="onCreateClass"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import AnnotationClassDialog from '@/components/Classes/AnnotationClassDialog/AnnotationClassDialog.vue'
import ClassesContextMenu from '@/components/Classes/ClassesContextMenu.vue'
import ClassesGallery from '@/components/Classes/ClassesGallery.vue'
import ClassesSidebar from '@/components/Classes/Sidebar/Sidebar.vue'
import SearchField from '@/components/Common/SearchField.vue'
import ClassLoader from '@/components/Renderless/ClassLoader'
import {
  AnnotationClassPayload,
  DatasetPayload,
  LoadingStatus,
  RootState,
  TeamPayload
} from '@/store/types'
import {
  ParsedError
} from '@/utils'

@Component({
  name: 'team-classes',
  components: {
    AnnotationClassDialog,
    ClassesContextMenu,
    ClassesGallery,
    ClassesSidebar,
    ClassLoader,
    SearchField
  }
})
export default class TeamClasses extends Vue {
  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload

  @State(
    (state: RootState) =>
      state.dataset.datasets.find(d => d.id === state.dataset.currentDataset.id) || null
  )
  dataset!: DatasetPayload | null

  @Getter('filteredClasses', { namespace: 'aclass' })
  classes!: AnnotationClassPayload[]

  @State((state: RootState) => state.aclass.classSelected)
  classSelected!: { [key: number]: boolean }

  search: string = ''
  pickedDataset: DatasetPayload | null = null
  annotationClassesToCopy: AnnotationClassPayload[] = []

  $refs!: {
    classDialog: AnnotationClassDialog
  }

  @State((state: RootState) => state.aclass.classesLoadingStatus)
  classesLoadingStatus!: LoadingStatus

  get loading (): boolean {
    return [LoadingStatus.Unloaded, LoadingStatus.Loading].includes(this.classesLoadingStatus)
  }

  get selectedClasses (): AnnotationClassPayload[] {
    return this.classes.filter(aclass => this.classSelected[aclass.id])
  }

  mounted () {
    if (this.$route.hash === '#new') { this.onCreateClass() }
  }

  onSearch () {
    this.$store.commit('aclass/SET_SEARCH_TEXT', this.search)
  }

  onCreateClass () {
    this.openClassDialog()
  }

  onEditClass (annotationClass: AnnotationClassPayload) {
    this.openClassDialog(annotationClass)
  }

  openClassDialog (annotationClass?: AnnotationClassPayload) {
    this.$refs.classDialog.show(annotationClass)
  }

  updatedClass (params: { data?: AnnotationClassPayload, error?: ParsedError }) {
    const { data, error } = params
    if (error) { return }

    this.$store.commit('aclass/PUSH_CLASS', data)
  }
}
</script>

<style lang="scss" scoped>
.classes {
  @include row;
  width: 100%;
  height: 100%;
}

.classes__main {
  flex: 1 1 auto;
  @include col;
  height: 100%;
  position: relative;
  z-index: 2;
  overflow: hidden;
}

// Dataset Management Header
.classes__header {
  @include col;
  margin: 25px 50px 0 50px;
  width: calc(100% - 100px);
}

.classes__title {
  @include typography(xxl, mulish, bold);
  color: $color90Black;
  margin-bottom: 40px;
}

.classes__header__search {
  width: 100%;
  border-radius: 5px;
  cursor: pointer;
}

.classes__header__search__field {
  width: 100%;
}

// Dataset Images Part
.classes__tab__content {
  flex: 1 1 auto;
  @include col;
  align-items: center;
  position: relative;
  width: 100%;
  overflow: hidden;
}

.classes__new__dataset__modal__container {
  opacity: 1;
}

.classes__new__dataset__modal__container--hide {
  opacity: 0;
  z-index: 0;
}

.classes__sidebar-container {
  width: 250px;
  height: 100%;
  padding: 25px 13px 13px 13px;
  background: transparent;
  overflow: visible;
}
</style>
