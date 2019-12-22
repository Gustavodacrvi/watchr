<template>
  <div class="Tags">
    <Renderer
      type="tag"
      icon="tag"
      iconColor='var(--red)'
      :enableSort='true'
      :showColor='true'
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
      this.$store.dispatch('pushPopup', {comp: 'AddTag', payload: {...obj}, naked: true})
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
      for (const tag of tags) {
        tag.callback = () => {
          this.$router.push('/user?tag=' + tag.name)
        }
        tag.options = utilsTag.tagOptions(tag)
      }
      return tags
    },
  },
  watch: {
    getTags() {
      this.$emit('view-list', this.getTags.map(el => ({viewName: el.name, viewType: 'tag'})))
    }
  }
}

</script>
