
Vue.component('txt', {
  template: `
    <span :class='$root.themes.textStyle'><slot></slot></span>
  `,
})

Vue.component('ftaw', {
  template: `
    <i :class='[$root.themes.iconColor, $root.themes.mainColorHover]' @click='$emit("click")'></i>
  `,
})

Vue.component('btn', {
  template: `
    <button :class='$root.themes.buttonStyle' @click='$emit("click")'><slot></slot></button>
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
        attrs: { class: this.$root.themes.mainColor },
      },
      this.$slots.default,
    )
  },
  template: `
    <h{{lvl}} :class='$root.themes.mainColor'><slot></slot></h{{lvl}}>
  `,
})

// LINKS AND BUTTONS
Vue.component('white-link', {
  props: {
    to: String
  },
  template: `
    <a class='white-link' :class='[$root.themes.textStyle, $root.themes.mainColorHover]' :href='to'><slot></slot></a>
  `,
})

Vue.component('drop-link', {
  props: {
    to: String
  },
  template: `
    <a class='drop-link' :class='[$root.themes.textStyle, $root.themes.dropLinkStyle]' :href='to'><slot></slot></a>
  `,
})




Vue.component('big-icon', {
  template: `
    <ftaw class='fa fa-bars big-icon'></ftaw>
  `,
})

Vue.component('theme-switch', {
  props: {
    dark: Boolean,
  },
  template: `
    <div class='theme-switch' @click="$emit('change-theme')">
      <txt :class='$root.themes.mainColorHover'>Dark theme</txt>
      <div :class='$root.themes.backgroundStyle'>
        <div :class='[{ floatLeft: !dark, floatRight: dark }, $root.themes.cardStyle]' ></div>
      </div>
    </div>
  `,
})

Vue.component('thematic-break', {
  template: `
    <hr class='thematic-break' />
  `
})

Vue.component('navigation', {
  props: {
    desktop: Boolean,
    dark: Boolean,
  },
  data() {
    return {
      showAlert: false,
      emailResent: false,
      username: undefined,
    }
  },
  mounted() {
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
        <div :class='$root.themes.cardStyle'>
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
            <theme-switch @change-theme='$emit("change-theme")' :dark='dark'></theme-switch>
          </div>
          <div v-else>
            <div id='navigation-mobile-drop'>
              <big-icon></big-icon>
              <div class='round' :class='$root.themes.cardStyle'>
                <drop-link to='/'>Home</drop-link>
                <drop-link to='/login'>Login</drop-link>
                <drop-link to='/user'>User page</drop-link>
                <thematic-break></thematic-break>
                <theme-switch :class='[$root.themes.mobileThemeSwitchStyle, "mobile-theme-switch"]' @change-theme='$emit("change-theme")' :dark='dark'></theme-switch>
              </div>
            </div>
          </div>
        </div>
        <div v-show='showAlert'>
          <txt>We have sent an email with a confirmation link to your email address, your GTDF account will be <strong>deleted 7</strong> days after its creation if not confirmed.</txt>
          <txt v-if='!emailResent'>Click <a @click='resendEmail' class='blue-link' :class='$root.themes.textStyle'>here</a> to resend the email.</txt>
          <txt v-else>Email resent.</txt>
          <ftaw class='fa fa-times icon-medium' @click='closeAlert'></ftaw>
        </div>
      </div>
      <div></div>
    </div>
  `,
  methods: {
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
