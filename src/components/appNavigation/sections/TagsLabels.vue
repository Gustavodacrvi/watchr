<template>
  <icon-section ico='tags' title='Time tracking' :top="[
    {txt: 'Untagged', to: 'ntagged'},
  ]" 
  :middle="[
    {type: 'Link Group', lvl: 1, title: 'Calendar Tags', links: [
    ]},
    {type: 'Link Group', lvl: 1, icos: [
      { ico: 'plus', callback: popUp},
    ], title: 'Labels', links: labels},
    {type: 'Link Group', lvl: 1, title: 'Tag Group', links: [
    ]},
  ]" 
  :bottom="[]"
  ></icon-section>
</template>

<script lang="ts">
import Vue from 'vue';
import Section from '@/components/appNavigation/Section.vue';

export default Vue.extend({
  components: {
    'icon-section': Section,
  },
  methods: {
    popUp() {
      this.$store.commit('app/nav/pushPopUp', 'addlabel');
    },
  },
  computed: {
    labels(): any[] {
      const labels = this.$store.state.app.tags.labels;
      const links = [];
      const length = labels.length;
      for (let i = 0; i < length; i++) {
        links.push({
          txt: labels[i].name,
          to: 'custom',
        });
      }
      return links;
    },
  },
});

</script>
