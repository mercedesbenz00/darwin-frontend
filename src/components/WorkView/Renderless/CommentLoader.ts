import { Vue, Watch, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { WorkflowPayload, DatasetItemPayload } from '@/store/types'

/**
 * In charge of loading comments thread for the selected item's workflow
 */
@Component({ name: 'comment-loader' })
export default class CommentLoader extends Vue {
  mounted () { this.loadCommentThreads() }

  @State(state => state.workview.selectedDatasetItem)
  item!: DatasetItemPayload | null

  get workflow (): WorkflowPayload | null {
    const { item } = this
    if (!item) { return null }
    return item.current_workflow
  }

  @Watch('workflow')
  onWorkflow () { this.loadCommentThreads() }

  loadCommentThreads () {
    const { workflow } = this
    if (workflow) {
      this.$store.dispatch('workview/loadCommentThreads', workflow)
    } else {
      this.$store.commit('comment/SET_THREADS', [])
    }
  }

  render () { return null }
}
