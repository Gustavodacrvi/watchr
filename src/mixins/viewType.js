
import ViewRendererVue from '../components/View/ViewRenderer.vue'

export default {
  props: ['viewName', 'viewType'],
  components: {
    ViewRenderer: ViewRendererVue,
  },
}
