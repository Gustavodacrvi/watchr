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
      :onSortableAdd="onSortableAdd"

      alreadyExistMessage="This tag already exists."
      addMsg='Add tag'
      :existingItems='tags'

      inputPlaceholder='Tag name...'
      :getItemRef='getItemRef'
      
      @add='addTag'
      @buttonAdd='buttonAdd'
      @update='update'
    />
    <div style="height: 100px"></div>
  </div>
</template>

<script>

import RendererVue from '../Renderer.vue'

import { tagRef } from '@/utils/firestore'

import { mapState, mapGetters } from 'vuex'

import utilsTag from '@/utils/tag'

export default {
  components: {
    Renderer: RendererVue,
  },
  props: ['active', 'viewType'],
  methods: {
    getItemRef() {
      return tagRef()
    },
    addTag(obj) {
      this.$store.dispatch('tag/addTagInRootByIndex', obj)
    },
    
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
      isDesktopBreakPoint: 'isDesktopBreakPoint',
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
          tag.inputPlaceholder = 'Subtag name...'
          tag.fallbackItem = obj => ({...obj, parent: tag.id})
          tag.getItemRef = () => tagRef()
          tag.onItemAdd = obj => this.$store.dispatch('tag/addSubTagByIndex', obj)
          tag.alreadyExistMessage = 'This tag already exist.'

          tag.mapSubTagNumbers = tag => ({
              total: getNumberOfTasksByTag(tag.id).total,
            })

          tag.subList = getTags(tag.id, tag.order || [])
        }
        if (!parentId) return tags
        return this.checkMissingIdsAndSortArr(order, tags.map(el => ({...el, subList: null})))
      }

      return getTags()
    },
  },
}

</script>
