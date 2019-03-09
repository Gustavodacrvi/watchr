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
  mounted() {
    GETrequest('/authenticated', (json) => {
      let data = JSON.parse(json)
      
      console.log(data)
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
        <div class='card shadow'>
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
            <white-link to='/terms-of-use'>Terms of use</white-link>
            <white-link to='/privacy-policy'>Privacy policy</white-link>
          </div>
          <div v-else>
            <div id='navigation-mobile-drop'>
              <big-icon></big-icon>
              <div class='card round shadow'>
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
