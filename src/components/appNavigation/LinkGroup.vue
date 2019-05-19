<template>
  <span v-if='!link.type' class='navigation-link' @click='navigate(link.to)' :class='{active: isLinkActive(link.to)}' :key='link.to'><icon v-if='link.ico' class='link-icon' :ico='link.ico'></icon>{{ link.txt }}</span>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '@/components/generalComponents/Icon.vue';

export default Vue.extend({
  components: {
    'icon': Icon,
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

</style>
