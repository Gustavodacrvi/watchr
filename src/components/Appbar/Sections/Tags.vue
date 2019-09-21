<template>
  <div class="Tags">
    <AppbarElement v-for="(el,i) in sortedTags"
      type="tag"
      icon="tag"
      :key="el.id"
      :name="el.name"
      :tabindex="i + 1"
      :active="active"
      :viewType="viewType"
      :callback="el.callback"
    />
  </div>
</template>

<script>

import AppbarElementVue from '../AppbarElement.vue'

export default {
  components: {
    AppbarElement: AppbarElementVue,
  },
  props: ['active', 'viewType'],
  data() {
    return {
      tags: [
        {
          id: '1',
          name: 'Tag freaking one',
          times: 8,
        },
        {
          id: '2',
          name: 'Tag freakng two',
          times: 5,
        },
        {
          id: 'I am the third onw',
          name: 'I am the third tag',
          times: 9,
        },
        {
          id: 'asdf',
          name: 'Is this even real?',
          times: 2,
        },
        {
          id: '24',
          name: 'the last one',
          times: 10,
        }
      ],
    }
  },
  computed: {
    sortedTags() {
      let tags = this.tags.slice()
      tags = tags.sort((a, b) => a.name.localeCompare(b.name))
      tags = tags.sort((a, b) => b.times - a.times)
      for (const el of tags) {
        el.callback = () => {
          this.$router.push('/user?tag=' + el.name)
        }
      }
      return tags
    }
  },
}

</script>
