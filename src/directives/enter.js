function bind (el, binding, vnode) {
  el.enterEvent = event => {
    if (event.key === 'Enter') {
      event.stopPropagation()
      vnode.context[binding.expression](event)
    }
  }
  document.body.addEventListener('keydown', el.enterEvent)
}

function update (el, binding, vnode) {
  if (binding.value === binding.oldValue) { return }
  this.bind(el, binding, vnode)
}

function unbind (el) {
  document.body.removeEventListener('keydown', el.enterEvent)
}

export default {
  bind,
  update,
  unbind
}
