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
    ...mapState({
      selectedTasks: state => state.selectedTasks,
      tags: state => state.tag.tags,
    }),
    ...mapGetters({
      getNumberOfTasksByTag: 'task/getNumberOfTasksByTag',
      getSubTagsByParentId: 'tag/getSubTagsByParentId',
      l: 'l',
      isDesktop: 'isDesktop',
    }),
    sortedTags() {
      return this.$store.getters['tag/sortedTags']
    },
    getTags() {
      const getSubTagsByParentId = this.getSubTagsByParentId
      const getNumberOfTasksByTag = this.getNumberOfTasksByTag
      const pushRouter = this.$router.push
      const getTags = (level, parentId) => {
        const tags = getSubTagsByParentId({level, parentId}).map(tag => ({...tag}))
        if (tags.length === 0) return []

        for (const tag of tags) {
          tag.callback = () => pushRouter('/user?tag=' + tag.name)
          tag.options = utilsTag.tagOptions(tag, level + 1)

          tag.onSubTagUpdate = () => console.log('onUpdate')
          tag.onSubTagAdd = () => console.log('onAdd')
          tag.onSubTagSortableAdd = () => console.log('onSortableAdd')

          tag.numberOfTasks = tag => ({
              total: getNumberOfTasksByTag(tag.id).total,
          })

          tag.subList = getTags(level + 1, tag.id)
        }
        return tags
      }

      return getTags(0)
    },
  },
  watch: {
    getTags() {
      this.$emit('view-list', this.getTags.map(el => ({viewName: el.name, viewType: 'tag'})))
    }
  }
}

</script>
