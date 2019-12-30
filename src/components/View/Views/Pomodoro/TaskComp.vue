<template>
  <div class="TaskComp" :class="platform" @click.stop="selectTask">
    <div class="task rb cursor" ref="task">
      <span>{{ taskMsg }}</span>
      <CircleBubble/>
    </div>
  </div>
</template>

<script>

import utils from '@/utils/'

import { mapGetters, mapState } from 'vuex'

export default {
  methods: {
    findTask() {
      this.$store.dispatch('pushPopup', {
        comp: 'FastSearch',
        payload: {
          callback: (route, task) => {
            this.$store.commit('pomo/selectTask', task)
            this.bindTaskOptions([
              {
                name: this.l['Complete task'],
                callback: () => {
                  this.$store.dispatch('task/completeTasks', [this.task])
                  this.$store.commit('pomo/removeTask')
                },
              },
              {
                name: this.l['Remove task'],
                callback: () => {
                  this.bindTaskOptions([])
                  this.$store.commit('pomo/removeTask')
                },
              },
              {
                name: this.l['Select another task'],
                callback: () => {
                  this.findTask()
                }
              },
            ])
          },
          onlyTasks: true,
        }
      })
    },
    selectTask() {
      if (!this.task) this.findTask()
    },
    bindTaskOptions(opt) {
      utils.bindOptionsToEventListener(this.$refs['task'], opt, this, 'click')
    },
  },
  computed: {
    ...mapState({
      task: state => state.pomo.task,
    }),
    ...mapGetters({
      l: 'l',
      platform: 'platform',
      taskMsg: 'pomo/taskMsg',
    })
  },
}

</script>

<style scoped>

.TaskComp {
  display: flex;
  justify-content: center;
  transform: translateY(30px);
}

.mobile {
  transform: translateY(10px);
}

.no-transform {
  transform: translateY(0px);
}

.task {
  position: relative;
  display: inline-block;
  padding: 10px;
  max-width: 270px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition-duration: .2s;
}

.task:hover {
  background-color: var(--light-gray);
}

</style>
