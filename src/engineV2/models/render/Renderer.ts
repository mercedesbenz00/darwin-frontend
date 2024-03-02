import { Editor } from '@/engineV2/editor'

export default abstract class Renderer {
  editor!: Editor
  constructor (editor: Editor) {
    this.editor = editor
  }
}
