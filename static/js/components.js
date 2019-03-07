// LINKS AND BUTTONS
Vue.component('white-link', {
  props: {
    to: String
  },
  template: `
    <a class='white-link' :href='to'><slot></slot></a>
  `
})

Vue.component('navigation', {
  template: `
    <div>
      <div id='navigation' class='card'>
        <div>
          <white-link to='/'>Home</white-link>
          <white-link>Login</white-link>
          <white-link>User page</white-link>
        </div>
        <div>
        </div>
        <div>
          <white-link>Terms of use</white-link>
          <white-link>Privacy policy</white-link>
        </div>
      </div>
      <div></div>
    </div>
  `
})