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
import { mapState } from 'vuex'

export default {
  components: {
    AppbarElement: AppbarElementVue,
  },
  props: ['active', 'viewType'],
  computed: {
    ...mapState({
      tags: state => state.tag.tags,
    }),
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
    },
  },
}

</script>
