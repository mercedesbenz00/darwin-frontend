import { watch } from 'vue'
import { Store } from 'vuex'

import { useEditorLayout, useActiveView } from '@/composables/useEditorV2'
import { Editor } from '@/engineV2/editor'
import { Layout } from '@/engineV2/layout'
import { Annotation } from '@/engineV2/models'
import { errorToast } from '@/errors/toasts'
import { StageAnnotation } from '@/store/modules/workview/types'
import { compareByZIndex } from '@/store/modules/workview/utils'
import { RootState } from '@/store/types'
import { ErrorWithMessage } from '@/utils/error'
import { ErrorCodes } from '@/utils/error/errors'

export const useLinkAnnotations = (store: Store<RootState>, editor: Editor): Function => {
  const onSaveError = (error?: ErrorWithMessage): void => {
    const code = error ? error.code : null

    if (code === ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE) {
      store.commit('billing/SHOW_OUT_OF_STORAGE_DIALOG')
      return
    }

    const messageFromCode = code === ErrorCodes.ALREADY_IN_WORKFLOW
      ? 'Cannot self-assign item. You are already assigned to a different stage in the workflow.'
      : null

    const parsedMessage = error ? error.message : null
    const defaultMessage =
      'Unable to save changes. Please refresh your browser. If not, your work might not get saved.'

    const message = messageFromCode || parsedMessage || defaultMessage

    store.dispatch('toast/warning', { content: message })
  }

  const handleAnnotationCreate = async (annotation: Annotation): Promise<void> => {
    const params = annotation.serialize()
    if (!params) { return }

    const response = await store.dispatch('workview/createV2Annotation', params)
    if (response.error) { onSaveError(response.error) }
  }

  const handleAnnotationUpdate = async (annotation: Annotation): Promise<void> => {
    const params = annotation.serialize()
    if (!params) { return }

    const response = await store.dispatch('workview/updateV2Annotation', params)
    if (response.error) { onSaveError(response.error) }
  }

  const handleAnnotationDelete = async (annotation: Annotation): Promise<void> => {
    const params = annotation.serialize()
    if (!params) { return }

    const response = await store.dispatch('workview/deleteV2Annotation', params)
    if (response.error) { onSaveError(response.error) }
  }

  const handleAnnotationSelect = (annotationId: Annotation['id']): void => {
    store.commit('workview/SELECT_ANNOTATION', annotationId)
  }

  const handleAnnotationDeselect = (annotationId: Annotation['id']): void => {
    store.commit('workview/DESELECT_ANNOTATION', annotationId)
  }

  const handleAnnotationDeselectAll = (): void => {
    store.commit('workview/DESELECT_ALL_ANNOTATIONS')
  }

  const handleAnnotationHighlight = (annotationId: Annotation['id']): void => {
    store.commit('workview/HIGHLIGHT_ANNOTATION', annotationId)
  }

  const handleAnnotationUnhighlight = (annotationId: Annotation['id']): void => {
    store.commit('workview/UNHIGHLIGHT_ANNOTATION', annotationId)
  }

  const handleAnnotationUnhighlightAll = (): void => {
    store.commit('workview/UNHIGHLIGHT_ALL_ANNOTATIONS')
  }

  const handleAnnotationError = (): void => {
    errorToast()
  }

  const setStageAnnotations = (layout: Layout): void => {
    const annotations = store.state.workview.stageAnnotations

    layout.viewsList.forEach(view => {
      view.annotationManager?.setAnnotations([...annotations]
        .sort(compareByZIndex)
        .filter((stageAnnotation: StageAnnotation) =>
          view.isViewsAnnotation(stageAnnotation)
        ))
    })
  }

  const layout = useEditorLayout()

  watch(() => layout.value, (newLayout) => {
    setStageAnnotations(newLayout)
  }, { immediate: true })

  const activeView = useActiveView()

  watch(() => activeView.value, (newView, oldView) => {
    oldView?.annotationManager.off('annotation:create', handleAnnotationCreate)
    oldView?.annotationManager.off('annotation:update', handleAnnotationUpdate)
    oldView?.annotationManager.off('annotation:delete', handleAnnotationDelete)
    oldView?.annotationManager.off('annotation:select', handleAnnotationSelect)
    oldView?.annotationManager.off('annotation:deselect', handleAnnotationDeselect)
    oldView?.annotationManager.off('annotation:deselectAll', handleAnnotationDeselectAll)
    oldView?.annotationManager.off('annotation:highlight', handleAnnotationHighlight)
    oldView?.annotationManager.off('annotation:unhighlight', handleAnnotationUnhighlight)
    oldView?.annotationManager.off('annotation:unhighlightAll', handleAnnotationUnhighlightAll)
    oldView?.annotationManager.off('annotation:error', handleAnnotationError)

    newView.annotationManager.on('annotation:error', handleAnnotationError)
    newView.annotationManager.on('annotation:create', handleAnnotationCreate)
    newView.annotationManager.on('annotation:update', handleAnnotationUpdate)
    newView.annotationManager.on('annotation:delete', handleAnnotationDelete)
    newView.annotationManager.on('annotation:select', handleAnnotationSelect)
    newView.annotationManager.on('annotation:deselect', handleAnnotationDeselect)
    newView.annotationManager.on('annotation:deselectAll', handleAnnotationDeselectAll)
    newView.annotationManager.on('annotation:highlight', handleAnnotationHighlight)
    newView.annotationManager.on('annotation:unhighlight', handleAnnotationUnhighlight)
    newView.annotationManager.on('annotation:unhighlightAll', handleAnnotationUnhighlightAll)
  }, { immediate: true })

  const unsubscribe = store.subscribe(mutation => {
    switch (mutation.type) {
    case 'workview/SET_STAGE_ANNOTATIONS': {
      setStageAnnotations(layout.value)
      break
    }
    case 'workview/SHOW_ANNOTATION':
      editor.viewsList.forEach(view => {
        view.annotationManager.handleShowAnnotation(mutation.payload)
      })
      break
    case 'workview/HIDE_ANNOTATION':
      editor.viewsList.forEach(view => {
        view.annotationManager.handleHideAnnotation(mutation.payload)
      })
      break
    case 'workview/TOGGLE_ANNOTATION_VISIBILITY': {
      const stageAnnotation: StageAnnotation = mutation.payload
      if (stageAnnotation.isVisible) {
        editor.viewsList.forEach(view => {
          view.annotationManager.handleShowAnnotation(stageAnnotation.id)
        })
      } else {
        editor.viewsList.forEach(view => {
          view.annotationManager.handleHideAnnotation(stageAnnotation.id)
        })
      }
      break
    }
    case 'workview/UPDATE_ANNOTATIONS_VISIBILITY':
      editor.viewsList.forEach(view => {
        view.annotationManager.updateAnnotationsVisibility(mutation.payload)
      })
      break
    case 'workview/TOGGLE_ANNOTATIONS':
      editor.viewsList.forEach(view => {
        view.annotationManager.handleToggleAnnotations()
      })
      break
    case 'workview/CLEAR_STAGE_ANNOTATIONS':
      editor.viewsList.forEach(view => {
        view.annotationManager.cleanup()
      })
      break
    }
  })

  return (): void => {
    unsubscribe()
    activeView.value.annotationManager.off('annotation:create', handleAnnotationCreate)
    activeView.value.annotationManager.off('annotation:update', handleAnnotationUpdate)
    activeView.value.annotationManager.off('annotation:delete', handleAnnotationDelete)
    activeView.value.annotationManager.off('annotation:select', handleAnnotationSelect)
    activeView.value.annotationManager.off('annotation:deselect', handleAnnotationDeselect)
    activeView.value.annotationManager.off('annotation:deselectAll', handleAnnotationDeselectAll)
    activeView.value.annotationManager.off('annotation:highlight', handleAnnotationHighlight)
    activeView.value.annotationManager.off('annotation:unhighlight', handleAnnotationUnhighlight)
    activeView.value.annotationManager.off(
      'annotation:unhighlightAll',
      handleAnnotationUnhighlightAll
    )
    activeView.value.annotationManager.off('annotation:error', handleAnnotationError)
  }
}
