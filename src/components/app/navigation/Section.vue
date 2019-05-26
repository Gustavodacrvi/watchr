<template>
  <div class='section'>
    <icon @mouseover='showNav' :title='title' class='pointer icon-color-hover' :class='{color: isActive}' :ico='ico' sz='medium-medium' @click='selectIcon'></icon>
    <transition name='fade-transition'>
      <div class='section-content' v-show='isActive && isNavOpened'>
        <div class='top'>
          <link-group v-for='link in top' :link='link' :key='link.id' :lvl='1'></link-group>
        </div>
        <hr class='margin'/>
        <div class='middle'>
          <link-group v-for='link in middle' :link='link' :key='link.id' :lvl='1'></link-group>
        </div>
        <hr class='margin'/>
        <div class='bottom'>
          <link-group v-for='link in bottom' :link='link' :key='link.id' :lvl='1'></link-group>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '@/components/regular/Icon.vue';
import LinkGroup from '@/components/app/navigation/LinkGroup.vue';

export default Vue.extend({
  components: {
    'link-group': LinkGroup,
    'icon': Icon,
  },
  props: {
    title: String,
    ico: String,
    top: Array,
    middle: Array,
    middleInput: Object,
    bottom: Array,
  },
  methods: {
    selectIcon() {
      const vm: any = this;
      this.$store.commit('app/nav/selectSection', vm.ico);
    },
    showNav() {
      if (!this.$store.state.app.nav.fixed) {
        this.$store.commit('app/nav/show');
      }
    },
  },
  computed: {
    isActive(): boolean {
      const store: any = this.$store;
      return store.state.app.nav.section === this.ico;
    },
    isNavOpened(): boolean {
      const store: any = this.$store;
      return store.state.app.nav.open;
    },
  },
});
</script>

<style scoped>

.section {
  padding: 6px 10px;
}

.section-content {
  position: absolute;
  padding-left: 33px;
  top: 115px;
  box-sizing: border-box;
  min-width: 90%;
}

.margin {
  margin-top: 20px;
  border: none;
}

.icon {
  position: relative;
  z-index: 5;
}

</style>
