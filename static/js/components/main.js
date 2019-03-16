// LINKS AND BUTTONS
Vue.component('white-link', {
  props: {
    to: String
  },
  template: `
    <a class='white-link' :href='to'><slot></slot></a>
  `,
})

Vue.component('drop-link', {
  props: {
    to: String
  },
  template: `
    <a class='drop-link' :href='to'><slot></slot></a>
  `,
})

Vue.component('form-link', {
  props: {
    to: String
  },
  template: `
    <div class='form-el'>
      <a class='blue-link form-link' :href='to'><slot></slot></a>
    </div>
  `,
})



Vue.component('big-icon', {
  template: `
    <i class='fa fa-bars big-icon'></i>
  `,
})

Vue.component('theme-switch', {
  props: {
    dark: Boolean,
  },
  template: `
    <div class='theme-switch' @click="$emit('change-theme')">
      <span>Dark theme</span>
      <div>
        <div :class='{ floatLeft: dark, floatRight: !dark }'></div>
      </div>
    </div>
  `,
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
          this.showAlert = true
        }
      }
    })
  },
  template: `
    <div>
      <div id='navigation'>
        <div class='shadow' :class='$root.theme.card'>
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
            <white-link to='/terms-of-use'>Terms of use</white-link>
            <white-link to='/privacy-policy'>Privacy policy</white-link>
          </div>
          <div v-else>
            <div id='navigation-mobile-drop'>
              <big-icon></big-icon>
              <div class='round shadow' :class='$root.theme.card'>
                <drop-link to='/'>Home</drop-link>
                <drop-link to='/login'>Login</drop-link>
                <drop-link to='/user'>User page</drop-link>
                <drop-link to='/terms-of-use'>Terms of use</drop-link>
                <drop-link to='/privacy-policy'>Privacy policy</drop-link>
              </div>
            </div>
          </div>
        </div>
        <div v-show='showAlert'>
          <span>We have sent an email with a confirmation link to your email address, your GTDF account will be <strong>deleted 7</strong> days after its creation if not confirmed.</span>
          <span v-if='!emailResent'>Click <a @click='resendEmail' class='blue-link'>here</a> to resend the email.</span>
          <span v-else>Email resent.</span>
          <i class='fa fa-times icon-medium' @click='showAlert = false'></i>
        </div>
      </div>
      <div></div>
    </div>
  `,
  methods: {
    resendEmail() {
      this.emailResent = true
      POSTrequestData('/resend-confirmation-email', 'username='+this.username, (dt) => {

      })
    },
  },
})
