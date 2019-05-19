<template>
  <div class='section'>
    <icon @click='show = !show' class='pointer icon-color-hover' :ico='ico' sz='big-big'></icon>
    <transition name='fade-transition'>
      <div class='section-content' v-show='isActive && isNavOpened'>
        <div class='top'>
          <template v-for='link in top'>
            <router-link class='navigation-link' :key='link.to' :to='link.to'>{{ link.txt }}</router-link>
          </template>
        </div>
        <hr class='margin'/>
        <div class='middle'>
          <template v-for='link in middle'>
            <router-link class='navigation-link' :key='link.to' :to='link.to'>{{ link.txt }}</router-link>
          </template>
        </div>
        <hr class='margin'/>
        <div class='bottom'>
          <template v-for='link in bottom'>
            <router-link class='navigation-link' :key='link.to' :to='link.to'>{{ link.txt }}</router-link>
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
  computed: {
    isActive(): boolean {
      return this.$store.state.app.currentNavigationIcon === this.ico;
    },
    isNavOpened(): boolean {
      return this.$store.state.app.navigationOpened;
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
  text-decoration: none;
  margin-top: 4px;
  font-size: 1.2em;
  transition-duration: .2s;
}

.navigation-link:hover {
  color: #A97CFC
}

.margin {
  margin-top: 20px;
  border: none;
}

</style>
