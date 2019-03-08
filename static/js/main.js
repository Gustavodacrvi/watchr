const MAX_WIDTH_MOBILE_NAVIGATION_BAR = 796

let vm = new Vue({
  el: '#vue',
  data: {
    desktopLength: undefined,
    authentication: {
      httpSent: false,
    },
  },
  computed: {
    desktop() {
      return (this.desktopLength >= MAX_WIDTH_MOBILE_NAVIGATION_BAR)
    },
  },
  methods: {
    // AUTHENTICATION
    login() {
      console.log('do login')
    }
  },
})


vm.desktopLength = window.innerWidth
window.addEventListener('resize', () => vm.desktopLength = window.innerWidth)
