<template>
  <icon-section ico='tags' title='Time tracking' :top="[
    {txt: 'Untagged', to: 'ntagged', id: 'tags-untagged'},
  ]" 
  :middle="[
    {type: 'Link Group', title: 'Calendar Tags', links: [
    ]},
    {type: 'Link Group', icos: [
      { ico: 'plus', callback: popUp},
    ], title: 'Labels', links: labels},
    {type: 'Link Group', title: 'Tag Group', links: [
    ]},
  ]" 
  :bottom="[]"
  ></icon-section>
</template>

<script lang="ts">
import Vue from 'vue';
import Section from '@/components/app/navigation/Section.vue';

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
    getSubLabels(label: any): any[] {
      const labels = label.subLabels;
      const length = labels.length;
      const subLinks = [];

      for (let i = 0; i < length; i++) {
        subLinks.push({
          txt: labels[i].name,
          to: 'custom',
          id: labels[i].id,
          subLinks: this.getSubLabels(labels[i]),
          icos: [
            {ico: 'times', callback: this.deleteLabel},
          ],
        });
      }

      return subLinks;
    },
  },
  computed: {
    labels(): any[] {
      const labels = this.$store.state.app.tags.labels;
      const links = [];
      const length = labels.length;
      for (let i = 0; i < length; i++) {
        const subLinks = [];

        links.push({
          txt: labels[i].name,
          to: 'custom',
          id: labels[i].id,
          subLinks: this.getSubLabels(labels[i]),
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
