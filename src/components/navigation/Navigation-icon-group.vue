<template>
  <section>
    <dropdown class='navBar-margin-right text-align'>
      <template v-slot:handle>
        <icon class="icon-color-hover pointer" sz="big" ico="globe"></icon>
      </template>
      <template v-slot:content>
        <el @click='changeLang("en")'>English</el>
        <el @click='changeLang("pt-BR")'>Português(Brasil)</el>
      </template>
    </dropdown>
    <icon class='icon-color-hover pointer' sz='big' ico='adjust' @click='invertTheme'></icon>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from './../generalComponents/Icon.vue';

export default Vue.extend({
  components: {
    icon: Icon,
  },
  methods: {
    changeLang(lang: string) {
      this.$store.dispatch('lang/setLanguage', lang);
    },
    invertTheme() {
      this.$store.commit('theme/invertTheme');
    },
  },
});
</script>

<style scoped>

</style>
