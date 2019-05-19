<template>
  <span v-if='!link.type' class='navigation-link' @click='navigate(link.to)' :class='{active: isLinkActive(link.to)}' :key='link.to'><icon v-if='link.ico' class='link-icon' :ico='link.ico'></icon>{{ link.txt }}</span>
  <div class='link-group' v-else-if='link.type === "Link Group"'>
    <div class='header'>
      <icon ico='cube' sz='medium-medium'></icon>
      <span class='title'>{{ link.title }}</span>
      <span>
        <icon ico='angle-down' @click='show = !show' class='toggle pointer' :class='[show ? "down" : "up"]' sz='medium'></icon>
      </span>
    </div>
    <transition-group name='fade-transition'>
      <template v-if='show'>
        <template v-for='subLink in link.links'>
          <group-link v-if='subLink.to' :key='subLink.to' :link='subLink' :class='`level-${link.lvl}`'></group-link>
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
    navigate(route: string) {
      this.$store.commit('app/nav/pushComp', route);
      if (!this.$store.getters.NavbarisOnDesktop) {
        this.$store.commit('app/nav/hide');
      }
    },
    isLinkActive(link: string): boolean {
      return link === this.$store.state.app.nav.component;
    },
  },
});
</script>

<style scoped>

.navigation-link {
  display: flex;
  cursor: pointer;
  margin-top: 4px;
  font-size: 1.2em;
  transition-duration: .2s;
}

.navigation-link:hover, .navigation-link:hover .icon, .active, .active .icon {
  color: #A97CFC;
}

.link-icon {
  margin: 0 6px;
}

.header {
  width: 100%;
}

.toggle {
  float: right;
  transition-duration: .3s;
}

.down {
  transform: rotate(0deg);
}

.up {
  transform: rotate(180deg);
}

.link-group {
  margin-top: 12px;
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
  font-size: 1.15em;
}

</style>
