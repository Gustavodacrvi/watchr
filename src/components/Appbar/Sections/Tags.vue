<template>
  <div class="Tags">
    <Renderer
      type="tag"
      icon="tag"
      iconColor='var(--red)'
      :enableSort='true'
      :illustration='illustration'
      :list="getTags"
      :active="active"
      :viewType="viewType"
      :mapNumbers='numberOfTasks'
      @buttonAdd='buttonAdd'
      @update='update'
    />
    <div style="height: 100px"></div>
  </div>
</template>

<script>

import RendererVue from '../Renderer.vue'

import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    Renderer: RendererVue,
  },
  props: ['active', 'viewType'],
  methods: {
    update(ids) {
      this.$store.dispatch('tag/updateOrder', ids)
    },
    numberOfTasks(tag) {
      return {
        total: this.getNumberOfTasksByTag(tag.id).total,
      }
    },
    buttonAdd(obj) {
      this.$store.dispatch('pushPopup', {comp: 'AddTag', payload: {...obj}})
    }
  },
  computed: {
    ...mapState(['selectedTasks']),
    ...mapGetters({
      getNumberOfTasksByTag: 'task/getNumberOfTasksByTag',
      l: 'l',
      isDesktop: 'isDesktop',
    }),
    illustration() {
      let descr = this.l["You can add one by dropping the plus floating button in this region."]
      if (!this.isDesktop)
        descr = this.l["You can add one by clicking on the right corner icon."]
      return {
        descr,
        name: 'MultipleTags',
        title: this.l["You don't have any tags."],
        width: '80px',
      }
    },
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
                comp: 'AddTag', payload: {...el, editing: true},
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
