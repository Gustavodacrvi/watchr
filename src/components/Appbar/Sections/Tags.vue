<template>
  <div class="Tags">
    <Renderer
      type="tag"
      icon="tag"
      iconColor='var(--red)'
      :illustration='illustration'
      :list="getTags"
      :active="active"
      :viewType="viewType"
      :mapNumbers='numberOfTasks'
      :onTaskDrop='onTaskDrop'
      @buttonAdd='buttonAdd'
      @update='update'
      @apply='applySelectedTasks'
      @apply-selected-els='applySelectedEls'
    />
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
    applySelectedTasks(id) {
      this.$store.dispatch('task/handleTasksByAppnavElementDragAndDrop', {
        elIds: [id],
        taskIds: this.selectedTasks,
        type: 'tag',
      })
    },
    applySelectedEls({elIds, taskId}) {
      this.$store.dispatch('task/handleTasksByAppnavElementDragAndDrop', {
        elIds: elIds,
        taskIds: [taskId],
        type: 'tag',
      })
    },
    update(ids) {
      this.$store.dispatch('tag/updateOrder', ids)
    },
    numberOfTasks(tag) {
      return {
        total: this.getNumberOfTasksByTag(tag.id).total,
      }
    },
    onTaskDrop({taskId, elId}) {
      this.$store.dispatch('task/handleTasksByAppnavElementDragAndDrop', {
        elIds: [elId],
        taskIds: [taskId],
        type: 'tag',
      })
    },
    buttonAdd(index) {
      this.$store.dispatch('pushPopup', {comp: 'AddTag', payload: index})
    }
  },
  computed: {
    ...mapState(['selectedTasks']),
    ...mapGetters({
      getNumberOfTasksByTag: 'task/getNumberOfTasksByTag'
    }),
    illustration() {
      return {
        name: 'MultipleTags',
        title: "You don't have any tags.",
        descr: "You can add some by dropping the plus floating button in this region.",
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
