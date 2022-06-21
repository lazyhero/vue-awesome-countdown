import component from './component.vue'

const vac = {
  install: (app, options) => {
    const name = options || 'vac'
    app.component(name, component)
    app.component('countdown', component)
  }
}

if (typeof window !== "undefined" && window.Vue) {
  window.Vue.use(vac)
}

export default vac