<template>
  <div class="Tags">
    <Renderer
      type="tag"
      icon="tag"
      :list="getTags"
      :active="active"
      :viewType="viewType"
      @update='update'
    />
  </div>
</template>

<script>

import RendererVue from '../Renderer.vue'

import { mapState } from 'vuex'

export default {
  components: {
    Renderer: RendererVue,
  },
  props: ['active', 'viewType'],
  methods: {
    update(ids) {
      console.log(ids)
    }
  },
  computed: {
    sortedTags() {
      return this.$store.getters['tag/sortedTags']
    },
    getTags() {
      let tags = this.sortedTags.slice()
      for (const el of tags) {
        el.callback = () => {
          this.$router.push('/user?tag=' + el.name)
        }
        el.options = [
          {
            name: 'Edit tag',
            icon: 'pen',
            callback: () => {
              this.$store.dispatch('pushPopup', {
                comp: 'AddTag', payload: el,
              })
            },
          },
          {
            name: 'Delete tag',
            icon: 'trash',
            callback: () => {
              this.$store.dispatch('tag/deleteTag', el.id)
            }
          }
        ]
      }
      return tags
    },
  },
}

</script>
