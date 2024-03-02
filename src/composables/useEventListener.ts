import { isRef, onBeforeUnmount, onMounted, Ref, unref, watch } from 'vue'

// source https://logaretm.com/blog/my-favorite-5-vuejs-composables/
export function useEventListener (
  // the target could be reactive ref which adds flexibility
  target: Ref<EventTarget | null> | EventTarget,
  event: string,
  handler: EventListener
): void {
  // if its a reactive ref, use a watcher
  if (isRef(target)) {
    watch(target, (value, oldValue) => {
      oldValue?.removeEventListener(event, handler)
      value?.addEventListener(event, handler)
    })
  } else {
    // otherwise use the mounted hook
    onMounted(() => {
      target.addEventListener(event, handler)
    })
  }
  // clean it up
  onBeforeUnmount(() => {
    unref(target)?.removeEventListener(event, handler)
  })
}
