<template>
  <div class="Tags">
    <Renderer
      type="tag"
      icon="tag"
      iconColor='var(--red)'
      :enableSort='true'
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

import utilsTag from '@/utils/tag'

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
    sortedTags() {
      return this.$store.getters['tag/sortedTags']
    },
    getTags() {
      let tags = this.sortedTags.slice()
      for (const el of tags) {
        el.callback = () => {
          this.$router.push('/user?tag=' + el.name)
        }
        el.options = utilsTag.tagOptions(el, this.$store, this.l)
      }
      return tags
    },
  },
}

</script>
