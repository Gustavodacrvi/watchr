// LINKS AND BUTTONS
Vue.component('white-link', {
  props: {
    to: String
  },
  template: `
    <a class='white-link' :href='to'><slot></slot></a>
  `
})

Vue.component('big-icon', {
  template: `

  `,
})

Vue.component('drop-icon', {
  template: `
    <div class='drop-icon'>
      <big-icon></big-icon>
    </div>
  `,
})

Vue.component('navigation', {
  props: {
    desktop: Boolean,
  },
  template: `
    <div>
      <div id='navigation' class='card'>
        <div v-if='desktop'>
          <white-link to='/'>Home</white-link>
          <white-link>Login</white-link>
          <white-link>User page</white-link>
        </div>
        <div>
        </div>
        <div v-if='desktop'>
          <white-link>Terms of use</white-link>
          <white-link>Privacy policy</white-link>
        </div>
        <div else>
          <drop-icon>
          </drop-icon>
        </div>
      </div>
      <div></div>
    </div>
  `,
})