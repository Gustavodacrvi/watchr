<template>
  <span v-if='!link.type' class='navigation-link' @click='navigate(link.to)' :class='{active: isLinkActive(link.to)}' :key='link.to'><icon v-if='link.ico' class='link-icon' :ico='link.ico'></icon>{{ link.txt }}</span>
  <div class='link-group' v-else-if='link.type === "Link Group"'>
    <div class='header'>
      <icon ico='cube' sz='medium-medium'></icon>
      <span class='title'>{{ link.title }}</span>
    </div>
    <group-link v-for='subLink in link.links' :key='subLink.to' :link='subLink' :class='`level-${link.lvl}`'></group-link>
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


.level-1 {
  margin-left: 15px !important;
}

.header .title, .header .icon {
  color: #777777 !important;
}

.header .title {
  margin-left: 4px;
  font-size: 1.15em;
}

</style>
