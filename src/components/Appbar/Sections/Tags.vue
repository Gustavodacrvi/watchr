<template>
  <div class="Tags">
    <transition-group
      @enter='enter'
      @leave='leave'
    >
      <AppbarElement v-for="(el,i) in sortedTags"
        type="tag"
        icon="tag"
        :key="el.id"
        :name="el.name"
        :tabindex="i + 1"
        :active="active"
        :viewType="viewType"
        :callback="el.callback"
        :options='el.options'
      />
    </transition-group>
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
  methods: {
    enter(el, done) {
      el.style.opacity = 0
      el.style.height = '0px'
      setTimeout(() => {
        el.style.opacity = 1
        el.style.height = '35px'
        setTimeout(() => done(), 300)
      })
    },
    leave(el, done) {
      el.style.opacity = 0
      el.style.height = '0px'
      setTimeout(() => done(), 300)
    },
  },
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
