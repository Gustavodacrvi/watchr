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
    themes: {
      cardStyle: 'card-dark',
      backgroundStyle: 'background-dark',
      textStyle: 'text-dark',
      mainColor: 'color-dark',
    },
    authentication: {
      httpSent: false,
    },
  },
  mounted() {
    this.applyThemes(this.dark)
  },
  computed: {
    desktop() {
      return (this.desktopLength >= MAX_WIDTH_MOBILE_NAVIGATION_BAR)
    },
  },
  methods: {
    // THEME
    applyThemes(dark) {
      this.dark = dark
      if (dark)
      this.themes = {
        cardStyle: 'card-dark',
        backgroundStyle: 'background-dark',
        textStyle: 'text-dark',
        mainColor: 'color-dark',
      }
    else 
      this.themes = {
        cardStyle: 'card-white',
        backgroundStyle: 'background-white',
        textStyle: 'text-white',
        mainColor: 'color-white',
      }
    },
    // AUTHENTICATION
    login(obj) {
      console.log(obj)
    },
  },
})


vm.desktopLength = window.innerWidth
window.addEventListener('resize', () => vm.desktopLength = window.innerWidth)
