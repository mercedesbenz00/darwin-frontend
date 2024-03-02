function bind (el, binding, vnode) {
  el.escEvent = event => {
    if (event.key === 'Escape') {
      vnode.context[binding.expression](event)
    }
  }
  document.body.addEventListener('keydown', el.escEvent)
}

function update (el, binding, vnode) {
  if (binding.value === binding.oldValue) { return }
  this.bind(el, binding, vnode)
}

function unbind (el) {
  document.body.removeEventListener('keydown', el.escEvent)
}

export default {
  bind,
  update,
  unbind
}
