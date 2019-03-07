// LINKS AND BUTTONS
Vue.component('white-link', {
  props: {
    to: String
  },
  template: `
    <a class='white-link' :href='to'><slot></slot></a>
  `,
})

Vue.component('big-icon', {
  template: `
    <i class='fa fa-bars big-icon'></i>
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
        <div v-else>
          asf
        </div>
        <div>
        </div>
        <div v-if='desktop'>
          <white-link>Terms of use</white-link>
          <white-link>Privacy policy</white-link>
        </div>
        <div v-else>
          <div id='navigation-mobile-drop'>
            <big-icon></big-icon>
            <div class='card round shadow'>
              <drop-link to='/'>Home</drop-link>
              <drop-link>Login</drop-link>
              <drop-link>User page</drop-link>
              <drop-link>Terms of use</drop-link>
              <drop-link>Privacy policy</drop-link>
            </div>
          </div>
        </div>
      </div>
      <div></div>
    </div>
  `,
})