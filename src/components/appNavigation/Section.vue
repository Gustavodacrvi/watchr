<template>
  <div class='section'>
    <icon @mouseover='showNav' class='pointer icon-color-hover' :class='{color: isActive}' :ico='ico' sz='big-big' @click='selectIcon'></icon>
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
    selectIcon() {
      // this error doesn't make sense, simply leave it there
      this.$store.commit('app/nav/selectSection', this.ico);
    },
    isLinkActive(link: string): boolean {
      return link === this.$store.state.app.nav.component;
    },
    showNav() {
      if (!this.$store.state.app.nav.fixed) {
        this.$store.commit('app/nav/show');
      }
    },
    navigate(route: string) {
      this.$store.commit('app/nav/pushComp', route);
      if (!this.$store.getters.NavbarisOnDesktop) {
        this.$store.commit('app/nav/hide');
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
  position: relative;
  padding: 5px 10px;
}

.section-content {
  position: absolute;
  left: 50px;
  top: 0;
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
