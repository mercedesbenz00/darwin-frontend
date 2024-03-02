import VirtualDraggableList from './VirtualDraggableList.vue'

type VirtualDraggableChange<T> = { newItem: T, oldItem: T }

export default VirtualDraggableList

export {
  VirtualDraggableList,
  VirtualDraggableChange
}
