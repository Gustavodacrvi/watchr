<template>
  <div v-if='!link.type' class='link'>
    <div class='navigation-wrapper' @mouseover='showIcon = true' @mouseleave='showIcon = false'>
      <span class='navigation-link' @click='navigate(link)' :class='{active: isLinkActive(link.txt)}' :key='link.id'><icon v-if='link.ico' class='link-icon' :ico='link.ico' sz='tiny'></icon>{{ link.txt }}
      </span>
      <span class='navigation-icons'>
        <transition-group name='fade-transition'>
          <template v-if='link.icos && showIcon'>
            <icon class='navigation-icon pointer icon-color-hover color-red' v-for='ico in link.icos' :blink='true' :key='ico.ico' :ico='ico.ico' @dblclick='ico.callback(link.id)' sz='medium'></icon>
          </template>
        </transition-group>
        <icon v-if='link.subLinks && link.subLinks.length > 0' class='navigation-icon pointer icon-color-hover' :key='`hide-sublinks-ico-${link.id}`' ico='angle-down' sz='medium' :class="[show ? 'down' : 'up']" @click='show = !show'></icon>
      </span>
    </div>
    <template v-if='show'>
      <div class='sub-links' v-if='link.subLinks'>
        <group-link v-for='subLink in link.subLinks' :key='subLink.id' :link='subLink' :class='`level-${level}`' :lvl='lvl + 1'></group-link>
      </div>
    </template>
  </div>
  <div class='link-group' v-else-if='link.type === "Link Group"'>
    <div class='header'>
      <icon ico='cube' sz='tiny'></icon>
      <span class='title'>{{ link.title }}</span>
      <span class='icons'>
        <icon v-for='ico in link.icos' :key='`section-navigation-icon-${ico}`' :ico='ico.ico' @click='ico.callback' class='pointer' sz='medium-medium'></icon>
        <icon ico='angle-down' @click='show = !show' class='toggle pointer' :class='[show ? "down" : "up"]' sz='medium-medium'></icon>
      </span>
    </div>
    <transition-group name='fade-transition'>
      <template v-if='show'>
        <template v-for='subLink in link.links'>
          <group-link v-if='subLink.to' :key='subLink.id' :link='subLink' :class='`level-${level}`' :lvl='lvl + 1'></group-link>
          <group-link v-else :key='subLink.title + "vue-key"' :link='subLink' :class='`level-${level}`' :lvl='lvl + 1'></group-link>
        </template>
      </template>
    </transition-group>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '@/components/regular/Icon.vue';

export default Vue.extend({
  name: 'group-link',
  components: {
    icon: Icon,
  },
  props: {
    link: Object,
    lvl: Number,
  },
  data() {
    return {
      show: false,
      showIcon: false,
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
  computed: {
    level() {
      if (this.lvl > 1) {
        return 'sub';
      }
      return '1';
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
  width: 205px;
}

.level-1 {
  margin-left: 16px !important;
}

.level-sub {
  margin-left: 14px !important;
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
  margin-left: 8px;
}

</style>
