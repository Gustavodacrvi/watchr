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
    theme: 'light_orange',
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
    // THEMES
    getSavedTheme() {
      let theme = localStorage.getItem('theme')
      if (theme === null)
        return 'light_orange'
      else return theme
    },
    applyThemes(theme) {
      if (theme !== this.theme) {
        this.removeCurrentTheme()
        this.downloadTheme(theme)
      }

      localStorage.setItem('theme', theme)
    },
    removeCurrentTheme() {
      let link = document.getElementById(this.theme)
      link.parentNode.removeChild(link)
    },
    downloadTheme(theme) {
      var link = document.createElement('link')

      link.setAttribute('rel', 'stylesheet')
      link.setAttribute('type', 'text/css')
      link.setAttribute('href', '/css/' + theme + '.css')
      link.setAttribute('id', theme)
      document.getElementsByTagName('head')[0].appendChild(link)

    }
  },
})


vm.desktopLength = window.innerWidth
window.addEventListener('resize', () => vm.desktopLength = window.innerWidth)
