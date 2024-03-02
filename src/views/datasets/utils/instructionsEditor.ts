import md5 from 'blueimp-md5'
import { v4 as uuidv4 } from 'uuid'

import { api } from '@/utils'
import { isApiError } from '@/utils/api'

type InstructionsComponent = Vue & {
  froalaStickyContainer?: string,
  uploadFiles?: (files: File[], editor: FroalaEditor) => void,
}

export type FroalaEditor = {
  image: {
    get: () => unknown
    insert: (url: string, sanitize: boolean, data: Object | null, image: unknown) => void
  },
  file: {
    insert: (url: string, name: string, linkInfo: { link: string}) => void
  }
}

export function getEditorConfig (component: InstructionsComponent): Object {
  const key = process.env.VUE_APP_FROALA_KEY === '' ? '$FROALA_KEY' : process.env.VUE_APP_FROALA_KEY
  return {
    key,
    apiKey: key,
    theme: 'custom',
    placeholderText: 'Add Instructions here',
    charCounterCount: false,
    toolbarButtons: {
      moreText: {
        // DO NOT REORDER, ORDER MATTERS
        buttons: [
          'bold',
          'italic',
          'underline',
          'strikeThrough',
          'subscript',
          'superscript',
          'fontFamily',
          'fontSize',
          'textColor',
          'backgroundColor',
          'inlineClass',
          'inlineStyle',
          'clearFormatting'
        ]
      },
      moreParagraph: {
        // DO NOT REORDER, ORDER MATTERS
        buttons: [
          'alignLeft',
          'alignCenter',
          'formatOLSimple',
          'alignRight',
          'alignJustify',
          'formatOL',
          'formatUL',
          'paragraphFormat',
          'paragraphStyle',
          'lineHeight',
          'outdent',
          'indent',
          'quote']
      },
      moreRich: {
        // DO NOT REORDER, ORDER MATTERS
        buttons: [
          'insertLink',
          'insertImage',
          'insertVideo',
          'insertTable',
          'emoticons',
          'specialCharacters',
          'embedly',
          'insertFile',
          'insertHR']
      },
      moreMisc: {
        // DO NOT REORDER, ORDER MATTERS
        buttons: [
          'undo',
          'redo',
          'fullscreen',
          'print',
          'spellChecker',
          'selectAll',
          'html',
          'help'
        ],
        align: 'right',
        buttonsVisible: 2
      }
    },
    quickInsertButtons: null,
    pluginsEnabled: [
      'align',
      'char_counter',
      'code_beautifier',
      'code_view',
      'colors',
      'draggable',
      'embedly',
      'emoticons',
      'entities',
      'file',
      'font_family',
      'font_size',
      'fullscreen',
      'help',
      'image',
      'image_manager',
      'image_tui',
      'inline_class',
      'inline_style',
      'line_breaker',
      'line_height',
      'link',
      'lists',
      'paragraph_format',
      'paragraph_style',
      'quick_insert',
      'quote',
      'special_characters',
      'spell_checker',
      'table',
      'url',
      'video',
      'word_paste'
    ],
    scrollableContainer: component.froalaStickyContainer || 'body',
    events: {
      'image.beforeUpload': function (files: File[]): false {
        const editor = this as unknown as FroalaEditor
        if (component.uploadFiles) {
          component.uploadFiles(files, editor)
        }
        return false
      },
      'file.beforeUpload': function (files: File[]): false {
        const editor = this as unknown as FroalaEditor
        if (component.uploadFiles) {
          component.uploadFiles(files, editor)
        }
        return false
      }
    }
  }
}

type UploadParams = {
  gaCategory: string
  datasetId: number
}

const isImageFile = (file: File): boolean => {
  return file && file.type.split('/')[0] === 'image'
}

export async function uploadFiles (
  component: InstructionsComponent,
  files: File[],
  editor: FroalaEditor,
  { gaCategory, datasetId }: UploadParams
): Promise<void> {
  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    // if this was a paste, there is no name, so we generate one
    const name = file.name || uuidv4()
    const hash = md5(`${datasetId}${name}`)
    const extension = file.type.split('/').slice(-1)[0]

    let downloadUrl

    try {
      const baseUrl = 'datasets/instructions_upload_params'
      const { data } = await api.get(
        `${baseUrl}/?hash=${hash}&dataset_id=${datasetId}&extension=${extension}`
      )
      const uploadUrl = data.upload_url
      downloadUrl = data.url
      await api.uploadToS3(uploadUrl, file, file.type)
      component.$ga.event(gaCategory, 'upload_instruction_image', 'success')
    } catch (error: unknown) {
      component.$store.dispatch('toast/warning', {
        content: 'Failed to upload image. Please try again.'
      })
      if (!isApiError(error)) { continue }
      component.$ga.event(
        gaCategory,
        'upload_instruction_image',
        'failure_request_failed',
        error.response?.status
      )
      continue
    }

    if (isImageFile(file)) {
      // if this was a paste, the pasted image is already
      // in the editor and selected, so we auto-replace it with insert
      const $selectedImg = editor.image.get()
      editor.image.insert(downloadUrl, false, null, $selectedImg)
    } else {
      editor.file.insert(downloadUrl, name, { link: downloadUrl })
    }
  }
}
