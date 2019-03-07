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



Vue.component('big-icon', {
  template: `
    <i class='fa fa-bars big-icon'></i>
  `,
})

Vue.component('navigation', {
  props: {
    desktop: Boolean,
  },
  template: `
    <div>
      <div id='navigation' class='card shadow'>
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
      <div></div>
    </div>
  `,
})
