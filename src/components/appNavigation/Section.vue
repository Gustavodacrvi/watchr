<template>
  <div class='section'>
    <icon @mouseover='showNav' :title='title' class='pointer icon-color-hover' :class='{color: isActive}' :ico='ico' sz='big-big' @click='selectIcon'></icon>
    <transition name='fade-transition'>
      <div class='section-content' v-show='isActive && isNavOpened'>
        <div class='top'>
          <link-group v-for='link in top' :link='link' :key='link.to'></link-group>
        </div>
        <hr class='margin'/>
        <div class='middle'>
          <link-group v-for='link in middle' :link='link' :key='link.to'></link-group>
        </div>
        <hr class='margin'/>
        <div class='bottom'>
          <link-group v-for='link in bottom' :link='link' :key='link.to'></link-group>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '@/components/generalComponents/Icon.vue';
import LinkGroup from '@/components/appNavigation/LinkGroup.vue';

export default Vue.extend({
  components: {
    'link-group': LinkGroup,
    icon: Icon,
  },
  props: {
    title: String,
    ico: String,
    top: Array,
    middle: Array,
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
  padding: 5px 10px;
  width: 25px;
}

.section-content {
  position: absolute;
  left: 50px;
  top: 115px;
}

.margin {
  margin-top: 20px;
  border: none;
}

</style>
