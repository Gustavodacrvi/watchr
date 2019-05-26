<template>
  <nav id='mobile-nav'>
    <section id='mobile-nav-left'>
    </section>
    <section id='mobile-nav-right'>
      <icon v-if="!($store.getters.isOnMobileApp && ($route.path === '/guest' || $route.path === '/user'))" class='navBar-icon' position='right' :active='active' @toggle='toggleMobileSection'></icon>
    </section>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import Icon from '@/components/navigation/Icon.vue';

export default Vue.extend({
  components: {
    icon: Icon,
  },
  data() {
    return {
      active: false,
    };
  },
  methods: {
    toggleMobileSection() {
      if (this.active) {
        this.$store.commit('hideMobileSection');
      } else {
        this.$store.commit('showMobileSection');
      }
      this.active = !this.active;
    },
  },
});
</script>

<style scoped>

#mobile-nav {
  margin: 20px 18px;
}

#mobile-nav-left {
  float: left;
  clear: left;
}

#mobile-nav-right {
  float: right;
  clear: right;
}

.navBar-icon.active {
  left: 150px !important;
}

</style>
