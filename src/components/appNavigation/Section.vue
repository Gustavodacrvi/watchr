<template>
  <div class='section' @mouseleave='toggleNav'>
    <icon @click='show = !show' @mouseover='toggleNav' class='pointer icon-color-hover' :class='{color: isActive}' :ico='ico' sz='big-big'></icon>
    <transition name='fade-transition'>
      <div class='section-content' v-show='isActive && isNavOpened'>
        <div class='top'>
          <template v-for='link in top'>
            <router-link class='navigation-link' :class='{active: isLinkActive(link.to)}' :key='link.to' :to='link.to'>{{ link.txt }}</router-link>
          </template>
        </div>
        <hr class='margin'/>
        <div class='middle'>
          <template v-for='link in middle'>
            <router-link class='navigation-link' :key='link.to' :to='link.to'>{{ link.txt }}</router-link>
          </template>
        </div>
        <hr class='margin'/>
        <div class='bottom'>
          <template v-for='link in bottom'>
            <router-link class='navigation-link' :key='link.to' :to='link.to'>{{ link.txt }}</router-link>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '@/components/generalComponents/Icon.vue';

export default Vue.extend({
  components: {
    icon: Icon,
  },
  props: {
    ico: String,
    top: Array,
    middle: Array,
    bottom: Array,
  },
  methods: {
    isLinkActive(link: string): boolean {
      return link === this.$store.state.app.nav.component;
    },
    toggleNav() {
      if (!this.$store.state.app.nav.fixed) {
        this.$store.commit('app/nav/toggleNav');
      }
    },
  },
  computed: {
    isActive(): boolean {
      return this.$store.state.app.nav.section === this.ico;
    },
    isNavOpened(): boolean {
      return this.$store.state.app.nav.open;
    },
  },
});
</script>

<style scoped>

.section {
  padding: 0 10px;
}

.section-content {
  position: relative;
  left: 45px;
  top: -30px;
}

.navigation-link {
  display: block;
  text-decoration: none;
  margin-top: 4px;
  font-size: 1.2em;
  transition-duration: .2s;
}

.navigation-link:hover, .active {
  color: #A97CFC
}

.margin {
  margin-top: 20px;
  border: none;
}

</style>
