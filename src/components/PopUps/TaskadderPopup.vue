<template>
  <div class='label-adder'>
    <div class='title'>
      <h3>Add task</h3>
    </div>
    <div class='content'>
      <task-edit
        btn='Add task'
        :allow-priority='true'
        :allow-labels='true'
        :show-cancel='false'
        @enter='add'
      />
      <span v-show='isDesktop'
        class='margin txt'
      >You can open this pop up at any time by clicking the 'T' key.</span><br>
      <span v-show='isDesktop'
        class='margin txt'
      >You can close any pop up at any time by clicking 'H' key.</span>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation, Action, namespace } from 'vuex-class'

const taskVuex = namespace('task')

import TaskEdit from '@/components/AppViews/AppviewComponents/AppviewTaskedit.vue'

import { Alert, Perspective } from '../../interfaces/app'

@Component({
  components: {
    'task-edit': TaskEdit,
  },
})
export default class LabelAdder extends Vue {
  @State theme!: string
  @Getter isDesktop!: boolean
  @Mutation pushAlert!: (alert: Alert) => void

  @taskVuex.Action addTask!: (obj: {name: string, priority: string, labels: string[]}) => void

  add(obj: {name: string, priority: string, labels: string[]}) {
    console.log(obj)
    this.addTask(obj)
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
