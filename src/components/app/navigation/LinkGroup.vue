<template>
  <div v-if='!link.type' class='link'>
    <div class='navigation-wrapper' @mouseover='showIcon = true' @mouseleave='showIcon = false'>
      <span class='navigation-link' @click='navigate(link)' :class='{active: isLinkActive(link.txt), mobile: !isDesktop}' :key='link.id'>
        <icon v-if='link.ico' class='link-icon' :ico='link.ico' :color='link.iconColor' :sz='icoSz'></icon>{{ link.txt }}
      </span>
      <span class='navigation-icons'>
        <template v-if='isDesktop && link.icos && showIcon'>
          <transition-group name='fade-transition'>
            <icon class='navigation-icon pointer icon-color-hover' v-for='ico in link.icos' :class='`color-${ico.color}`' :blink='true' :key='ico.ico' :ico='ico.ico' @dblclick='ico.callback(link.id)' sz='tiny'></icon>
          </transition-group>
        </template>
        <icon-group v-if='!isDesktop && link.icos' class='navigation-icon pointer icon-color-hover' handle='ellipsis-v' :options="getIcons(link.icos, link.id)"></icon-group>
        <icon v-if='link.subLinks && link.subLinks.length > 0' class='navigation-icon pointer icon-color-hover' :key='`hide-sublinks-ico-${link.id}`' ico='angle-down' :sz='icoSz' :class="[show ? 'down' : 'up']" @click='show = !show'></icon>
      </span>
    </div>
    <template v-if='show'>
      <div class='sub-links' v-if='link.subLinks'>
        <group-link v-for='subLink in link.subLinks' :key='subLink.id' :link='subLink' :class='`level-${level}`' :lvl='lvl + 1'></group-link>
      </div>
    </template>
  </div>
  <div class='link-group' :class='{mobile: !isDesktop}' v-else-if='link.type === "Link Group"'>
    <div class='header' @click='show = !show'>
      <icon class='link-icon' ico='cube' :sz='icoSz'></icon>
      <span class='title' :class='{mobile: !isDesktop}'>{{ link.title }}</span>
      <span class='icons'>
        <icon v-for='ico in link.icos' :key='`section-navigation-icon-${ico}`' :ico='ico.ico' @click='ico.callback' class='pointer' sz='tiny'></icon>
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
import IconGroup from '@/components/regular/dropdown/IconGroup.vue';

export default Vue.extend({
  name: 'group-link',
  components: {
    'icon': Icon,
    'icon-group': IconGroup,
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
    getIcons(icos: any[], id: string): any[] {
      const length = icos.length;
      let arr: any = [];
      for (let i = 0; i < length; i++) {
        console.log(icos[i].dblclick)
        arr.push({
          ico: icos[i].ico,
          dblclick: icos[i].dblclick,
          callback: () => icos[i].callback(id),
          color: icos[i].color,
        });
      }

      return arr;
    },
    navigate(link: any) {
      if (link.callback) {
        link.callback();
      }      
      this.$store.commit('app/nav/pushComp', { component: link.to, txt: link.txt});
      if (!this.isDesktop) {
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
    isDesktop(): boolean {
      return this.$store.getters.NavbarisOnDesktop;
    },
    icoSz(): string {
      return !this.isDesktop ? 'medium-medium' : 'medium';
    },
  },
});
</script>

<style scoped>

.navigation-link {
  display: flex;
  cursor: pointer;
  flex-basis: 100%;
  font-size: 1.05em;
  transition-duration: .2s;
}

.navigation-link.mobile {
  font-size: 1.15em;
  padding: 3px;
}

.navigation-link:hover, .navigation-link:hover .icon, .active, .active .icon {
  color: #A97CFC;
  text-shadow: 0 0 1px #A97CFC;
}

.link-icon {
  margin: 1px 8px;
}

.header {
  width: 100%;
  cursor: pointer;
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
  width: 206px;
}

.link-group.mobile {
  width: 233px;
}

.level-1 {
  margin-left: 16px !important;
}

.level-sub {
  margin-left: 14px !important;
}

.header .title {
  font-size: 1.05em;
}

.title.mobile {
  font-size: 1.15em;
}

.navigation-wrapper {
  display: flex;
  position: relative;
  margin-top: 9px;
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
