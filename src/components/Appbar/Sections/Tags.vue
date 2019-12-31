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
      checkMissingIdsAndSortArr: 'checkMissingIdsAndSortArr',
      l: 'l',
      isDesktop: 'isDesktop',
    }),
    sortedTags() {
      return this.$store.getters['tag/sortedTags']
    },
    getTags() {
      const getSubTagsByParentId = this.getSubTagsByParentId
      const getNumberOfTasksByTag = this.getNumberOfTasksByTag
      const getTags = (level, parentId, order) => {
        const tags = getSubTagsByParentId({level, parentId}).map(tag => ({...tag}))
        if (tags.length === 0) return []

        for (const tag of tags) {
          tag.callback = () => this.$router.push('/user?tag=' + tag.name)
          tag.options = utilsTag.tagOptions(tag)

          tag.onSubTagUpdate = ids => {
            this.$store.dispatch('tag/saveTag', {
              id: tag.id, order: ids,
            })
          }
          tag.onSubTagAdd = obj => {
            this.$store.dispatch('pushPopup', {comp: 'AddTag', payload: {...obj, level: level + 1, parent: tag.id}, naked: true})
          }
          tag.onSubTagSortableAdd = (d, tagId, ids) => {
            this.$store.dispatch('tag/moveTagBetweenTags', {
              parent: tag.id, tagId, ids, level: level + 1,
            })
          }

          tag.numberOfTasks = tag => ({
              total: getNumberOfTasksByTag(tag.id).total,
          })

          tag.subList = getTags(level + 1, tag.id, tag.order || [])
        }
        if (level === 0) return tags
        return this.checkMissingIdsAndSortArr(order, tags)
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
