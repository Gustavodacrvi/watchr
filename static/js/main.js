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

function GETrequest(route, callback) {
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200)
      callback(this.responseText)
  }
  xhttp.open('GET', route, !0)
  xhttp.send()
}

let vm = new Vue({
  el: '#vue',
  data: {
    desktopLength: undefined,
    dark: false,
    themes: undefined,
    authentication: {
      httpSent: false,
    },
  },
  beforeMount() {
    this.applyThemes(this.getSavedTheme())
  },
  computed: {
    desktop() {
      return (this.desktopLength >= MAX_WIDTH_MOBILE_NAVIGATION_BAR)
    },
  },
  methods: {
    getSavedTheme() {
      let dark = localStorage.getItem('dark')
      if (dark === null || dark === 'false')
        return false
      else return true
    },
    // THEME
    applyThemes(dark) {
      this.dark = dark
      localStorage.setItem('dark', dark)
      
    },
  },
})


vm.desktopLength = window.innerWidth
window.addEventListener('resize', () => vm.desktopLength = window.innerWidth)
