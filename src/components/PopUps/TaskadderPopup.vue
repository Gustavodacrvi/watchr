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
        :allow-date='true'
        :show-cancel='false'
        :input='input'
        input-theme='dark'
        @enter='add'
      />
      <span v-show='isDesktop'
        class='margin txt'
        :class='theme'
      >You can open this pop up at any time by clicking the 'T' key.</span><br>
      <span v-show='isDesktop'
        class='margin txt'
        :class='theme'
      >You can close any pop up at any time by clicking 'H' key.</span>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation, Action, namespace } from 'vuex-class'

const taskVuex = namespace('task')

import TaskEdit from '@/components/AppViews/AppviewComponents/Tasks/AppviewTaskedit.vue'

import { Alert, Perspective } from '../../interfaces/app'
import { IndexState, IndexGetters, IndexMutations } from '../../interfaces/store/index'

@Component({
  components: {
    'task-edit': TaskEdit,
  },
})
export default class LabelAdder extends Vue {
  @State theme!: IndexState.theme
  @Getter isDesktop!: IndexGetters.IsDesktop
  @Mutation pushAlert!: IndexMutations.PushAlert

  @taskVuex.Action addTask!: (obj: {name: string, priority: string, labels: string[]}) => void

  input: string = ''

  mounted() {
    setTimeout(() => {
      this.input = ''
    }, 80)
  }
  add(obj: {name: string, priority: string, labels: string[]}) {
    this.addTask({...obj})
    this.pushAlert({
      name: 'Task successfully added.',
      duration: 2.5,
      type: 'success',
    })
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
