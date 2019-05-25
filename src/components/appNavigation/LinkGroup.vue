<template>
  <div v-if='!link.type' class='navigation-wrapper'>
    <span class='navigation-link' @click='navigate(link)' :class='{active: isLinkActive(link.txt)}' :key='link.id'><icon v-if='link.ico' class='link-icon' :ico='link.ico' sz='tiny'></icon>{{ link.txt }}
    </span>
    <span class='navigation-icons' v-if='link.icos'>
      <icon class='navigation-icon pointer icon-color-hover' v-for='ico in link.icos' :key='ico.ico' :ico='ico.ico' @click='ico.callback(link.id)'></icon>
    </span>
  </div>
  <div class='link-group' v-else-if='link.type === "Link Group"'>
    <div class='header'>
      <icon ico='cube' sz='tiny'></icon>
      <span class='title'>{{ link.title }}</span>
      <span class='icons'>
        <icon v-for='ico in link.icos' :key='`section-navigation-icon-${ico}`' :ico='ico.ico' @click='ico.callback' class='pointer' sz='medium'></icon>
        <icon ico='angle-down' @click='show = !show' class='toggle pointer' :class='[show ? "down" : "up"]' sz='medium'></icon>
      </span>
    </div>
    <transition-group name='fade-transition'>
      <template v-if='show'>
        <template v-for='subLink in link.links'>
          <group-link v-if='subLink.to' :key='subLink.id' :link='subLink' :class='`level-${link.lvl}`'></group-link>
          <group-link v-else :key='subLink.title + "vue-key"' :link='subLink' :class='`level-${link.lvl}`'></group-link>
        </template>
      </template>
    </transition-group>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '@/components/generalComponents/Icon.vue';

export default Vue.extend({
  name: 'group-link',
  components: {
    icon: Icon,
  },
  props: {
    link: Object,
  },
  data() {
    return {
      show: false,
    };
  },
  methods: {
    navigate(link: any) {
      if (link.callback) {
        link.callback();
      }      
      this.$store.commit('app/nav/pushComp', { component: link.to, txt: link.txt});
      if (!this.$store.getters.NavbarisOnDesktop) {
        this.$store.commit('app/nav/hide');
      }
    },
    isLinkActive(txt: string): boolean {
      return txt === this.$store.state.app.nav.componentText;
    },
  },
});
</script>

<style scoped>

.navigation-link {
  display: flex;
  cursor: pointer;
  flex-basis: 95%;
  font-size: 1.1em;
  transition-duration: .2s;
}

.navigation-link:hover, .navigation-link:hover .icon, .active, .active .icon {
  color: #A97CFC;
  text-shadow: 0 0 1px #A97CFC;
}

.link-icon {
  margin: 2px 6px;
}

.header {
  width: 100%;
}

.icons {
  position: absolute;
  right: 0;
  margin-top: 3px;
}

.icons .icon {
  margin: 0 4px;
}

.toggle {
  transition-duration: .3s;
}

.down {
  transform: rotate(0deg);
}

.up {
  transform: rotate(180deg);
}

.link-group {
  margin-top: 8px;
  width: 250px;
}

.level-1 {
  margin-left: 15px !important;
}

.level-2 {
  margin-left: 17px !important;
}

.header .title, .header .icon {
  color: #777777 !important;
}

.header .title {
  margin-left: 4px;
  font-size: 1.1em;
}

.navigation-wrapper {
  display: flex;
  position: relative;
  margin-top: 8px;
}

.navigation-icons {
  flex-basis: 5%;
  display: flex;
  align-items: center;
}

.navigation-icon {
  margin-left: 3px;
}

</style>
