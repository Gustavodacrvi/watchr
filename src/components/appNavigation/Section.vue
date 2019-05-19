<template>
  <div class='section' @mouseleave='hideNav'>
    <icon @mouseover='showNav' class='pointer icon-color-hover' :class='{color: isActive}' :ico='ico' sz='big-big'></icon>
    <transition name='fade-transition'>
      <div class='section-content' v-show='isActive && isNavOpened'>
        <div class='top'>
          <template v-for='link in top'>
            <span class='navigation-link' @click='navigate(link.to)' :class='{active: isLinkActive(link.to)}' :key='link.to'>{{ link.txt }}</span>
          </template>
        </div>
        <hr class='margin'/>
        <div class='middle'>
          <template v-for='link in middle'>
            <span class='navigation-link' @click='navigate(link.to)' :class='{active: isLinkActive(link.to)}' :key='link.to'>{{ link.txt }}</span>
          </template>
        </div>
        <hr class='margin'/>
        <div class='bottom'>
          <template v-for='link in bottom'>
            <span class='navigation-link' @click='navigate(link.to)' :class='{active: isLinkActive(link.to)}' :key='link.to'>{{ link.txt }}</span>
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
    showNav() {
      if (!this.$store.state.app.nav.fixed) {
        this.$store.commit('app/nav/show');
      }
    },
    hideNav() {
      if (!this.$store.state.app.nav.fixed) {
        this.$store.commit('app/nav/hide');
      }
    },
    navigate(route: string) {
      this.$store.commit('app/nav/pushComp', route);
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
  cursor: pointer;
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
