function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function removeUnderline(str) {
  let newStr = ''
  let length = str.length
  for (let i=0;i<length;i++)
    if (str[i] === '_') newStr += ' '
    else newStr += str[i]
  return capitalizeFirstLetter(newStr)
}


Vue.component('root-preloading', {
  data() {
    return {
      str: 'Loading'
    }
  },
  mounted() {
    setInterval(this.addChar, 150)
  },
  template: `
    <div class='preloading'>
      <h1>{{ this.str }}</h1>
    </div>
  `,
  methods: {
    addChar() {
      this.str += '.'
    }
  },
})

Vue.component('txt', {
  template: `
    <span class='text'><slot></slot></span>
  `,
})

Vue.component('ftaw', {
  template: `
    <i class='icon-color main-color-hover' @click='$emit("click")'></i>
  `,
})

Vue.component('btn', {
  template: `
    <button class='button' @click='$emit("click")'><slot></slot></button>
  `,
})

Vue.component('heading', {
  props: {
    lvl: Number,
  },
  render: function (createElement) {
    return createElement(
      'h' + this.lvl,
      {
        attrs: { class: 'main-color' },
      },
      this.$slots.default,
    )
  },
  template: `
    <h{{lvl}} class='main-color'><slot></slot></h{{lvl}}>
  `,
})

// LINKS AND BUTTONS
Vue.component('white-link', {
  props: {
    to: String
  },
  template: `
    <a class='white-link text main-color-hover' :href='to'><slot></slot></a>
  `,
})

Vue.component('drop-link', {
  props: {
    to: String
  },
  template: `
    <a class='drop-link text drop-link' :href='to' @click='$emit("click")'><slot></slot></a>
  `,
})




Vue.component('big-icon', {
  template: `
    <ftaw class='fa fa-bars big-icon'></ftaw>
  `,
})

Vue.component('thematic-break', {
  template: `
    <hr class='thematic-break' />
  `
})

Vue.component('dropdown', {
  props: {
    hdlstyle: String,
    hdlvalue: String,
    floatdirect: String,
  },
  data() {
    return {
      opd: false,
    }
  },
  template: `
    <div class='dropdown'  @mouseover='opd = true' @mouseleave='opd = false'>
      <span :class='hdlstyle'>{{ this.hdlvalue }}<ftaw class='fa fa-angle-up'></ftaw></span>
      <transition name='dropdown'>
        <div v-if='opd' :class='{flexCenter: floatdirect === "center"}'>
          <div class='card container round' :class='{floatRight: floatdirect === "right", floatLeft: floatdirect === "left"}'>
            <slot></slot>
          </div>
        </div>
      </transition>
    </div>
  `,
  computed: {

  }
})

Vue.component('navigation', {
  props: {
    desktop: Boolean,
  },
  data() {
    return {
      showAlert: false,
      emailResent: false,
      username: undefined,
    }
  },
  created() {
    GETrequest('/authenticated', (json) => {
      let data = JSON.parse(json)
      
      if (data.isAuthenticated) {
        this.username = data.username
        if (!data.confirmed) {
          if (typeof(Storage) !== "undefined")
            this.checkIfUserClosedTheAlertPopUpInTheSameSession()
          else this.showAlert = true
        }
      }
    })
  },
  template: `
    <div>
      <div id='navigation'>
        <div class='card'>
          <div v-if='desktop'>
          
            <white-link to='/'>Home</white-link>
            <white-link to='/login'>Login</white-link>
            <white-link to='/user'>User page</white-link>
          </div>
          <div v-else>
          </div>
          <div>
          </div>
          <div v-if='desktop'>
            <dropdown style='z-index: 100' hdlstyle='white-link text main-color-hover' :hdlvalue='getThemeName($root.theme)' floatdirect='center'>
              <drop-link @click='$root.changeTheme("light_orange")'>Light orange</drop-link>
              <drop-link @click='$root.changeTheme("dark_light_blue")'>Dark light blue</drop-link>
            </dropdown>
          </div>
          <div v-else>
            <div id='navigation-mobile-drop'>
              <big-icon></big-icon>
              <div class='round card'>
                <drop-link to='/'>Home</drop-link>
                <drop-link to='/login'>Login</drop-link>
                <drop-link to='/user'>User page</drop-link>
              </div>
            </div>
          </div>
        </div>
        <div v-show='showAlert' class='alert-card'>
          <txt>We have sent an email with a confirmation link to your email address, your GTDF account will be <strong>deleted 7</strong> days after its creation if not confirmed.</txt>
          <txt v-if='!emailResent'>Click <a @click='resendEmail' class='blue-link'>here</a> to resend the email.</txt>
          <txt v-else>Email resent.</txt>
          <ftaw class='fa fa-times icon-medium' @click='closeAlert'></ftaw>
        </div>
      </div>
      <div></div>
    </div>
  `,
  methods: {
    getThemeName(theme) {
      return removeUnderline(theme)
    },
    closeAlert() {
      this.showAlert = false
      sessionStorage.setItem('confirmationEmailAlert', 'closed')
    },
    resendEmail() {
      this.emailResent = true
      POSTrequestData('/resend-confirmation-email', 'username='+this.username, (dt) => {

      })
    },
    checkIfUserClosedTheAlertPopUpInTheSameSession() {
      let state = sessionStorage.getItem('confirmationEmailAlert')

      if (state === null) {
        this.showAlert = true
      } else if (state === 'closed') {
        this.showAlert = false
      }
    }
  },
})
