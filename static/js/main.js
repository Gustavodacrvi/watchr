const MAX_WIDTH_MOBILE_NAVIGATION_BAR = 796


function POSTrequestData(route, params, callback) {
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200)
      callback(this.responseText)
  }
  xhttp.open('POST', route, !0)
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  xhttp.send(params)
}

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
    login(obj) {
      console.log(obj)
    },
  },
})


vm.desktopLength = window.innerWidth
window.addEventListener('resize', () => vm.desktopLength = window.innerWidth)
