<template>
  <icon-section ico='tags' title='Time tracking' :top="[
    {txt: 'Untagged', to: 'ntagged', id: 'tags-untagged'},
  ]" 
  :middle="[
    {type: 'Link Group', lvl: 1, title: 'Calendar Tags', links: [
      {txt: 'fuck ass', lvl: 1, to: 'asdfasdfasf', id: 'jfkdsaçlçalsdfj', subLinks: [
        {txt: 'sub link2', to: 'fucking', id: 'suck dick', lvl: 2},
        {txt: 'sub link5', to: 'fucking', id: 'suck dick1', lvl: 2},
        {txt: 'fuck ass', to: 'asdfasdfasf', lvl: 2, id: 'jfkdsaçlçalsfdsadfj', subLinks: [
          {txt: 'sub link2', to: 'fucking', id: 'suck dickasfd', lvl: 3},
          {txt: 'sub link5', to: 'fucking', id: 'suck dick1fdf', lvl: 3},
          {txt: 'fuck ass', to: 'asdfasdfasf', lvl: 3, id: 'jfkdsaçlçalsfdsadfj', subLinks: [
            {txt: 'sub link2', to: 'fucking', id: 'suck dickasfd', lvl: 4},
            {txt: 'sub link5', to: 'fucking', id: 'suck dick1fdf', lvl: 4},
            {txt: 'fuck ass', to: 'asdfasdfasf', lvl: 4, id: 'jfkdsaçlçalsfdsadfj'}
          ]}
        ]}
      ]},
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
    deleteLabel(id: string) {
      this.$store.dispatch('app/deleteLabelById', id);
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
          id: labels[i].id,
          icos: [
           {ico: 'times', callback: this.deleteLabel},
          ],
        });
      }
      return links;
    },
  },
});

</script>
