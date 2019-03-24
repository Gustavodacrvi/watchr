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
      if (dark)
      this.themes = {
        cardStyle: 'card-dark',
        backgroundStyle: 'background-dark',
        textStyle: 'text-dark',
        mainColor: 'color-dark',
        buttonStyle: 'button-dark',
        inputStyle: 'input-dark',
        mainColorHover: 'color-dark-hover',
        iconColor: 'icon-color-dark',
        dropLinkStyle: 'drop-link-style-dark',
        mobileThemeSwitchStyle: 'mobile-theme-switch-dark'
      }
      else 
        this.themes = {
          cardStyle: 'card-white',
          backgroundStyle: 'background-white',
          textStyle: 'text-white',
          mainColor: 'color-white',
          buttonStyle: 'button-white',
          inputStyle: 'input-white',
          mainColorHover: 'color-white-hover',
          iconColor: 'icon-color-white',
          dropLinkStyle: 'drop-link-style-white',
          mobileThemeSwitchStyle: 'mobile-theme-switch-white'
      }
    },
  },
})


vm.desktopLength = window.innerWidth
window.addEventListener('resize', () => vm.desktopLength = window.innerWidth)
