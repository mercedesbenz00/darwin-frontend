import { computed, onBeforeUnmount, onMounted, Ref, ref } from 'vue'

import { validateFileListTypes } from '@/components/Dataset/DropZone/fileTypeValidation'
import { useToast } from '@/composables/useToast'

/**
 * A way to extract drop area logic shared between v1 and v2 DropArea components,
 * since it's exactly identical and the only difference is at the template level.
 *
 * Once the V1 component is removed, this should go back into the component
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useDroparea = (
  props: {
    acceptedFileTypes: string[],
    multiple: boolean
  },
  emit: ((e: 'files-added' | 'file-added', files: FileList | File[] | File) => void)
) => {
  const input = ref<HTMLInputElement | null>(null)
  const toast = useToast()

  const emitAdded = (files: File[] | FileList): void => {
    if (files.length === 0) { return }
    if (props.multiple) { emit('files-added', files) }
    emit('file-added', files[0])
  }

  const acceptedFileExtensions = computed(() =>
    props.acceptedFileTypes.filter(type => type.startsWith('.'))
  )

  const dragging = ref(false)
  let dragCount = 0

  /**
   * Due to how drag events work, we must count every dragenter, and subtract
   * every drag leave.
   *
   * The reason for this is, these events will trigger pairwise for every child
   * of the parent who we are listening to.
   *
   * If the new value ends at > 0, user is dragging. Otherwise, user has
   * finished dragging.
   */
  const dragChange = (e: DragEvent): void => {
    if (e.type === 'dragenter') {
      dragCount++
    }
    if (e.type === 'dragleave') {
      dragCount--
    }

    dragging.value = dragCount === 0 ? false : true
  }

  /** dragover needs to be blocked this way in order for drop to trigger */
  const stopAndPrevent = (e: DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
  }

  const endDrag = (): void => {
    dragCount = 0
    dragging.value = false
  }

  /* Handles files dropped onto the dropzone */
  const onDrop = (event: DragEvent): void => {
    event.preventDefault()

    endDrag()

    if (!event.dataTransfer?.files) { return }
    if (!validateFileListTypes(event.dataTransfer.files, acceptedFileExtensions.value)) {
      toast.warning({ meta: { title: 'Unable to upload. Unsupported file format' } })
      return
    }

    emitAdded(event.dataTransfer.files)
  }

  /**
   * Sets up event bindings which result in the drop area hover section showing
   * up when the user drags files into the window, rather than just when they
   * drag them over the droparea itself.
   *
   * This is used in the V2 droparea, but could be used generally, or even be
   * extracted into a general composable
   */
  const setupGlobalDragActivation = (droparea: Ref<HTMLDivElement | null>): void => {
    onMounted(() => {
      droparea.value?.addEventListener('dragover', stopAndPrevent)
      droparea.value?.addEventListener('drop', onDrop)
      document.addEventListener('dragenter', dragChange)
      document.addEventListener('dragleave', dragChange)
      // We could have multiple dropareas on the page. This will make sure all
      // of them end drag mode if files are dropped onto any of them.
      document.addEventListener('drop', endDrag)
      // We could also drop files onto something else that isn't a drop area
      // that will make those files open in a new tab, so this will make sure
      // all drop areas end drag in that case.
      window.addEventListener('blur', endDrag)
    })

    onBeforeUnmount(() => {
      droparea.value?.removeEventListener('dragover', stopAndPrevent)
      droparea.value?.removeEventListener('drop', onDrop)
      document.removeEventListener('dragenter', dragChange)
      document.removeEventListener('dragleave', dragChange)
      document.removeEventListener('drop', endDrag)
      window.removeEventListener('blur', endDrag)
    })
  }

  /* Handles files pasted into the dropdown */
  const onPaste = (event: ClipboardEvent): void => {
    if (!event.clipboardData) { return }

    const files = []
    const items = event.clipboardData.items

    for (const item of items) {
      const file = item.getAsFile()
      if (!file) { continue }
      if (!validateFileListTypes([file], props.acceptedFileTypes)) { continue }
      files.push(file)
    }

    if (files.length > 0) {
      emitAdded(files)
      event.preventDefault()
    }
  }

  onMounted((): void => {
    document.addEventListener('paste', onPaste)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('paste', onPaste)
  })

  /* Handles files added into the drop area using the file dialog */
  const onPick = (event: Event): void => {
    const input = event.target as HTMLInputElement
    if (!input.files) { return }

    if (!validateFileListTypes(input.files, acceptedFileExtensions.value)) {
      toast.warning({ meta: { title: 'Unable to upload. Unsupported file format' } })
      return
    }
    emitAdded(input.files)
  }

  return {
    acceptedFileExtensions,
    dragging,
    input,
    onDrop,
    onPick,
    setupGlobalDragActivation
  }
}
