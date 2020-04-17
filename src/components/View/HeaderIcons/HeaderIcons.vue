<template>
  <div class="HeaderIcons"
    :style="style"

    @click.stop
    @pointerup.stop
    @mouseup.stop
    @touchend.stop.passive
  >
    <div class="wrapper">
      <HeaderIcon v-for="obj in getListIcons" :key="obj.id"
        :ref='obj.id'
        v-bind='obj'

        @save='save'
        @click.native='iconClick(obj.id)'
      />
    </div>
  </div>
</template>

<script>

import HeaderIcon from './HeaderIcon.vue'

import editBuilderMixin from "@/mixins/editBuilder.js"

import { mapState, mapGetters } from 'vuex'

export default {
  mixins: [editBuilderMixin],
  components: {
    HeaderIcon,
  },
  props: ['width', 'getHeaderIcons', 'viewId'],
  data() {
    return {
      model: {
        group: (this.viewType === 'group' && this.viewId) || null,
      },
    }
  },
  methods: {
    focusOnHeaderIcon(id) {
      Object.keys(this.$refs).forEach(key => {
        if (this.$refs[key][0])
          this.$refs[key][0].active = false
      })
      this.$nextTick(() => {
        if (this.$refs[id])
          this.$refs[id][0].active = true
      })
    },
    save(model) {
      if (this.selectedItems.length) {

        if (model.tags && model.tags.length) {

          if (this.selectedType === "Task") {
            this.$store.dispatch('task/addTagsToTasksById', {
              ids: this.selectedItems.slice(),
              tagIds: model.tags,
            })
          } else {
            this.$store.dispatch('list/addTagsToListsById', {
              ids: this.selectedItems.slice(),
              tagIds: model.tags,
            })
          }

        } else {

          if (this.selectedType === 'Task')
            this.$store.dispatch('task/saveTasksById', {
              ids: this.selectedItems.slice(),
              task: model,
            })
          else if (this.selectedType === 'List')
            this.$store.dispatch('list/saveListsById', {
              ids: this.selectedItems.slice(),
              list: model,
            })

        }
      }
    },
    iconClick(id) {
      const keys = Object.keys(this.$refs).filter(key => key !== id)
      keys.forEach(key => {
        if (this.$refs[key][0])
          this.$refs[key][0].active = false
      })
    },
  },
  computed: {
    ...mapState(['selectedType', 'selectedItems']),
    ...mapGetters({
      getTasksById: 'task/getTasksById',
      getListsById: 'list/getListsById',
    }),

    style() {
      return {
        left: this.width + 'px',
        width: `calc(100% - ${this.width}px)`,
      }
    },

    taskListIcons() {
      return [
        this.calendarSmartIconObj,
        this.getMoveToListSmartIconObj,
        this.deadlineSmartIconObj,
        this.getPrioritySmartIconObj,
        this.rightSmartIconDurationObj,
      ]
    },
    listListIcons() {
      return [
        this.calendarSmartIconObj,
        this.getFilteredListSmartIconObj,
        this.deadlineSmartIconObj,
      ]
    },
    defaultIcons() {
      return [
        {
          id: 'go_back',
          simple: true,
          props: {
            title: 'Go to previous view, "Left Arrow"',
            icon: 'arrow',
            color: 'var(--fade)',
            callback: () => this.$root.$children[0].goBack(),
          },
        },
        {
          id: 'task',
          simple: true,
          props: {
            title: 'Add task, "A"',
            icon: 'plus',
            color: 'var(--txt)',
            callback: () => this.$emit('add-task'),
          },
        },
        {
          id: 'list',
          simple: true,
          props: {
            title: "Add list",
            icon: 'pie',
            progress: 30,
            color: 'var(--txt)',
            callback: () => this.$emit('add-list'),
          },
        },
        {
          id: 'heading',
          simple: true,
          props: {
            title: 'Add heading, "H"',
            icon: 'heading',
            color: 'var(--txt)',
            callback: () => this.$emit('add-heading'),
          },
        },
        {
          id: 'search',
          simple: true,
          props: {
            title: 'Quick search, "F"',
            icon: 'search',
            color: 'var(--txt)',
            callback: () => this.$store.dispatch('pushPopup', {
              comp: 'FastSearch',
            }),
          },
        },
        {
          id: 'go_next',
          simple: true,
          props: {
            title: 'Go to next view, "Right Arrow"',
            icon: 'arrow',
            color: 'var(--fade)',
            callback: () => this.$root.$children[0].goNext(),
          },
        },
      ]
    },
    getIcons() {
      if (this.getHeaderIcons)
        return this.getHeaderIcons(this.defaultIcons)
      return this.defaultIcons
    },
    areGroupItems() {
      const items = this.selectedType === "Task" ? this.getTasksById(this.selectedItems) : this.getListsById(this.selectedItems)
      return items.every(item => item.group)
    },
    getListIcons() {
      if (this.selectedItems.length) {
        const arr = (this.selectedType === "Task" ? this.taskListIcons : this.listListIcons).slice()

        if (this.areGroupItems) {
          arr.unshift(this.getAssigneSmartIconObj)
        } else {
          arr.splice(3, 0, this.getSmartIconTags)
        }
        
        return arr
      }
      return this.getIcons
    },
  },
  watch: {
    viewId() {
      this.model.group = this.viewId || null
    },
  },
}

</script>

<style scoped>

.HeaderIcons {
  position: fixed;
  height: 40px;
  border: none;
  bottom: 0;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--light-gray);
  background-color: var(--back-color);
  transition-duration: .15s;
  z-index: 100;
}

.wrapper {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  margin: 0 50px;
  flex-basis: 850px;
}

.flip-list-move {
  transition: transform .15s;
}

</style>
