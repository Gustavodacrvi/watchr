<template>
  <div class='section'>
    <icon @click='show = !show' class='pointer icon-color-hover' :ico='ico' sz='big-big'></icon>
    <div class='section-content'>
      <div class='top'>
        <template v-for='link in top'>
          <router-link class='navigation-link' :key='link.to' :to='link.to'>{{ link.txt }}</router-link>
        </template>
      </div>
    </div>
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
  },
  data() {
    return {
      show: true,
    };
  },
  computed: {
    isActive(): boolean {
      return this.$store.state.app.currentNavigationIcon === this.ico;
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
  left: 50px;
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

</style>
