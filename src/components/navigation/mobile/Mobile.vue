<template>
  <nav id='mobile-nav'>
    <section id='mobile-nav-left'>
    </section>
    <section id='mobile-nav-right'>
      <icon v-if="!isOnAppRoute || (isOnAppRoute && !isStandAlone)" class='navBar-icon' position='right' :active='active' @toggle='toggleMobileSection'></icon>
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
  computed: {
    isDesktop(): boolean {
      return this.$store.getters.NavbarisOnDesktop;
    },
    isOnAppRoute(): boolean {
      return this.$route.path === '/guest' || this.$route.path === '/user';
    },
    isStandAlone(): boolean {
      return this.$store.getters.isStandAlone;
    },
  },
});
</script>

<style scoped>

#mobile-nav {
  margin: 20px 18px;
  z-index: 100;
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
