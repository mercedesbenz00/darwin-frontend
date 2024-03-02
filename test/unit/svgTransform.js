const vueCompiler = require('vue/compiler-sfc')

module.exports = {
  // Because some svg files imported as Vue components
  render () { return '<div></div>' },
  process (content) {
    const { render } = vueCompiler.parse(content, {
      attrs: {
        functional: false
      }
    })

    return {
      code: `module.exports = { render: ${render} }`
    }
  }
}
