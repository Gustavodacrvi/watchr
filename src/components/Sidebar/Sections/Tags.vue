<template>
  <div class="Tags">
    <Renderer
      type="tag"
      icon="tag"
      iconColor='var(--red)'
      inputPlaceholder='Tag name...'
      :enableSort='true'
      :showColor='true'
      :list="getTags"
      :active="active"
      :viewType="viewType"
      :mapNumbers='numberOfTasks'
      :onSortableAdd="onSortableAdd"
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
        total: this.getNumberOfTasksByTag({tagId: tag.id, tags: this.tags}).total,
      }
    },
    buttonAdd(obj) {
      this.$store.dispatch('pushPopup', {comp: 'AddTag', payload: {...obj}, naked: true})
    },
    onSortableAdd(f, tagId, ids) {
      this.$store.dispatch('tag/moveTagToRoot', {
        tagId, ids,
      })
    },
  },
  computed: {
    ...mapState({
      selectedItems: state => state.selectedItems,
    }),
    ...mapGetters({
      tags: 'tag/tags',
      getNumberOfTasksByTag: 'task/getNumberOfTasksByTag',
      getSubTagsByParentId: 'tag/getSubTagsByParentId',
      checkMissingIdsAndSortArr: 'checkMissingIdsAndSortArr',
      isDesktop: 'isDesktop',
      sortedRootTags: 'tag/sortedRootTags',
    }),
    getTags() {
      const getSubTagsByParentId = this.getSubTagsByParentId
      const getNumberOfTasksByTag = this.getNumberOfTasksByTag
      const getTags = (parentId, order) => {
        const tags = parentId ? getSubTagsByParentId(parentId) : this.sortedRootTags

        if (tags.length === 0) return []

        for (const tag of tags) {
          tag.callback = () => {
            this.$router.push('/user?tag=' + tag.name)
          }
          tag.options = utilsTag.tagOptions(tag)

          tag.onSubTagUpdate = ids => {
            this.$store.dispatch('tag/saveTag', {
              id: tag.id, order: ids,
            })
          }
          tag.onSubTagAdd = obj => {
            this.$store.dispatch('pushPopup', {comp: 'AddTag', payload: {...obj, parent: tag.id}, naked: true})
          }
          tag.onSubTagSortableAdd = (d, tagId, ids) => {
            this.$store.dispatch('tag/moveTagBetweenTags', {
              parent: tag.id, tagId, ids
            })
          }

          tag.mapSubTagNumbers = tag => ({
              total: getNumberOfTasksByTag({tagId: tag.id, tags: this.tags}).total,
          })

          tag.subList = getTags(tag.id, tag.order || [])
        }
        if (!parentId) return tags
        return this.checkMissingIdsAndSortArr(order, tags)
      }

      return getTags()
    },
  },
}

</script>
