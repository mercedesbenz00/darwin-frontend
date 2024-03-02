import Vue from 'vue'

const extendComponent = (component: any, propsData: any) => {
  const ExtendedComponent = Vue.extend(component)
  return new ExtendedComponent({ propsData })
}

export const mountedComponentHtml = (component: any, propsData: any) => {
  return extendComponent(component, propsData).$mount().$el.innerHTML
}
