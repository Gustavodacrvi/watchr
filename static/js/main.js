const MAX_WIDTH_MOBILE_NAVIGATION_BAR = 796


function setCookie(name, value, expireDays, path) {
  let d = new Date()
  d.setTime(d.getTime() + (expireDays * 24 * 60 * 60 * 1000))
  let expires = 'expires='+d.toUTCString()
  document.cookie = name + '=' + value + ';' + expires + ';path=' + path
}

function getCookie(name) {
  let nm = name + '='
  let ca = document.cookie.split(';')
  for(let i=0;i<ca.length;i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ')
      c = c.substring(1)
    if (c.indexOf(nm) === 0)
      return c.substring(nm.length, c.length)
  }
  return ''
}

function checkCookie(name) {
  let user = getCookie(name)
  if (user !== '')
    return true
  return false
}

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
    l: undefined,
    desktopLength: undefined,
    mounted: false,
    theme: undefined,
    authentication: {
      httpSent: false,
    },
  },
  created() {
    this.l = l
    this.theme = this.getSavedTheme()
  },
  mounted() {
    this.mounted = true
  },
  computed: {
    desktop() {
      return (this.desktopLength >= MAX_WIDTH_MOBILE_NAVIGATION_BAR)
    },
    isPreloding() {
      return (!this.mounted && !this.l)
    }
  },
  methods: {
    // LANGUAGE
    changeLang(lang) {
      if (lang !== this.l.lang) {
        let oldLang = this.l.lang
        this.downloadLang(lang, () => {
          this.removeLang(oldLang)
          this.l = l
        })
      }

      setCookie('lang', lang, 28, '/')
    },
    downloadLang(lang, callback) {
      lang = this.parseFileNameToLang(lang)
      let scr = document.createElement('script')

      scr.setAttribute('id', lang)
      scr.setAttribute('type', 'text/javascript')
      scr.setAttribute('src', '/js/langs/' + lang + '.js')
      scr.onload = callback
      document.getElementsByTagName('head')[0].appendChild(scr)
    },
    removeLang(lang) {
      let scr = document.getElementById(this.parseLangToFileName(lang))
      scr.parentNode.removeChild(scr)
    },
    parseFileNameToLang(lang) {
      let str = ''
      let len = lang.length
      for (let i=0;i<len;i++)
        if (lang[i] === '-')
          str += '_'
        else str += lang[i]
      return str
    },
    parseLangToFileName(lang) {
      let str = ''
      let len = lang.length
      for (let i=0;i<len;i++)
        if (lang[i] === '-')
          str += '_'
        else str += lang[i]
      return str
    },
    // THEMES
    getSavedTheme() {
      let theme = getCookie('theme')
      if (theme === '')
        return 'light_orange'
      return theme
    },
    changeTheme(theme) {
      if (theme !== this.theme) {
        let oldTheme = this.theme
        this.downloadTheme(theme, () => {
          this.removeTheme(oldTheme)
          this.theme = theme
        })
      }

      setCookie('theme', theme, 28, '/')
    },
    removeTheme(theme) {
      let link = document.getElementById(theme)
      link.parentNode.removeChild(link)
    },
    downloadTheme(theme, callback) {
      let link = document.createElement('link')

      link.setAttribute('rel', 'stylesheet')
      link.setAttribute('type', 'text/css')
      link.setAttribute('href', '/css/' + theme + '.css')
      link.setAttribute('id', theme)
      link.onload = callback
      document.getElementsByTagName('head')[0].appendChild(link)
    }
  },
})


vm.desktopLength = window.innerWidth
window.addEventListener('resize', () => vm.desktopLength = window.innerWidth)

let cookieName = 'everywhere'
