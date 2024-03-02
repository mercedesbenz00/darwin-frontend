import Vue from 'vue'

export default async () => {
  // Require Froala Editor js file.
  await Promise.all([
    import(/* webpackChunkName: "froala" */ 'froala-editor/js/plugins.pkgd.min.js'),
    import(/* webpackChunkName: "froala" */ 'froala-editor/js/third_party/embedly.min'),
    import(/* webpackChunkName: "froala" */ 'froala-editor/js/third_party/font_awesome.min'),
    import(/* webpackChunkName: "froala" */ 'froala-editor/js/third_party/spell_checker.min'),
    import(/* webpackChunkName: "froala" */ 'froala-editor/js/third_party/image_tui.min'),
    import(/* webpackChunkName: "froala" */ 'froala-editor/css/froala_editor.pkgd.min.css')
  ])

  return import(/* webpackChunkName: "froala" */ 'vue-froala-wysiwyg')
    .then(({ default: VueFroala }) => {
      Vue.use(VueFroala)
    })
}
