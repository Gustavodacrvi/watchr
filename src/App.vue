<template>
  <div id='body' class='background' :class='$store.state.style'>
    <nav-bar v-if='!$store.state.lang.loading'></nav-bar>
    <transition :class='$store.state.style' name='router-view' mode='out-in'>
      <loading v-if='$root.loading || $store.state.lang.loading'></loading>
      <router-view v-else/>
    </transition>
    <toast></toast>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import store from './store';
import axios from 'axios';
import NavBar from './components/navigation/Nav-bar.vue';
import Toast from './components/generalComponents/Toast.vue';
import Loading from './components/generalComponents/Loading.vue';

import { getCookie, setCookie } from './assets/javaScript/cookies';

export default Vue.extend({
  components: {
    'nav-bar': NavBar,
    'toast': Toast,
    'loading': Loading,
  },
  beforeCreate() {
    const sessionToken = getCookie('watchrSessionToken');
    if (sessionToken !== '') {
      axios.post('http://localhost:3000/autologin', { token: sessionToken }).then((res: any) => {
        if (res.data.validToken) {
          store.commit('logUser', res.data.user);
        } else {
          setCookie('watchrSessionToken', '', 30);
        }
      });
    }

    const style = getCookie('darkTheme');
    if (style !== '') {
      this.$store.commit('changeThemeTo', style);
    }
  },
});
</script>



<style>
@import './assets/css/main/button.css';
@import './assets/css/main/fontawesome.min.css';
@import './assets/css/main/icon.css';
@import './assets/css/main/input.css';
@import './assets/css/main/main.css';
@import './assets/css/main/toast.css';
@import './assets/css/main/transitions.css';

@import './assets/css/light/main.css';
@import './assets/css/light/toast.css';
@import './assets/css/light/input.css';

@import './assets/css/dark/main.css';
@import './assets/css/dark/toast.css';
@import './assets/css/dark/input.css';


body {
  margin: 0;
}

#body {
  position: absolute;
  width: 100%;
  height: 100%;
}

</style>
