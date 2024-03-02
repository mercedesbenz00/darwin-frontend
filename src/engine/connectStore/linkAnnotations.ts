import { Store } from 'vuex'

import { Editor } from '@/engine/editor'
import { StageAnnotation } from '@/store/modules/workview/types'
import { RootState } from '@/store/types'

export const linkAnnotations = (store: Store<RootState>, editor: Editor): Function => {
  return store.subscribe(mutation => {
    switch (mutation.type) {
    // NOTE: We don't want to subscribe to UPDATE_STAGE_ANNOTATION here
    // as that will prevent us from debouncing the update request and is not strictly needed
    case 'workview/SET_STAGE_ANNOTATIONS': {
      const sortedAnnotationsByStage = store.getters['workview/sortedAnnotationsByStage']
      const stage = store.state.workview.selectedStageInstance
      const currentStoreAnnotations = sortedAnnotationsByStage(stage)

      editor.viewsList.forEach(view => {
        view.annotationManager?.setAnnotations(currentStoreAnnotations
          .filter((stageAnnotation: StageAnnotation) =>
            view.isViewsAnnotation(stageAnnotation)
          ))
      })
      break
    }
    case 'workview/HIGHLIGHT_ANNOTATION':
      editor.viewsList.forEach(view => {
        view.annotationManager.handleHighlightAnnotation(mutation.payload)
      })
      break
    case 'workview/UNHIGHLIGHT_ANNOTATION':
      editor.viewsList.forEach(view => {
        view.annotationManager.handleUnhighlightAnnotation(mutation.payload)
      })
      break
    case 'workview/UNHIGHLIGHT_ALL_ANNOTATIONS':
      editor.viewsList.forEach(view => {
        view.annotationManager.handleUnhighlightAllAnnotations()
      })
      break
    case 'workview/SELECT_ANNOTATION':
      editor.viewsList.forEach(view => {
        view.annotationManager.handleSelectAnnotation(mutation.payload)
      })
      break
    case 'workview/DESELECT_ANNOTATION':
      editor.viewsList.forEach(view => {
        view.annotationManager.handleDeselectAnnotation(mutation.payload)
      })
      break
    case 'workview/TOGGLE_ANNOTATION_SELECTION': {
      const stageAnnotation: StageAnnotation = mutation.payload
      if (stageAnnotation.isSelected) {
        editor.viewsList.forEach(view => {
          view.annotationManager.handleSelectAnnotation(stageAnnotation.id)
        })
      } else {
        editor.viewsList.forEach(view => {
          view.annotationManager.handleDeselectAnnotation(stageAnnotation.id)
        })
      }
      break
    }
    case 'workview/DESELECT_ALL_ANNOTATIONS':
      editor.viewsList.forEach(view => {
        view.annotationManager.handleDeselectAllAnnotations()
      })
      break
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
}
