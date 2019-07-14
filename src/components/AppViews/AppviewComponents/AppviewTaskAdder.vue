<template>
  <div class='wrapper'>
    <transition name='fade' mode='out-in'>
      <div v-if='!showing' @click='showing = true' key='notshowing' class='msg'>
        <i class='icon pointer txt fas fa-plus fa-lg'></i>
        <span class='txt name'>Add task</span>
      </div>
      <task-edit key='showing' v-else
        :fixed-tag='fixedTag'
        :allow-priority='allowPriority'
        @cancel='showing = false'
        @enter='enter'
      />
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import TaskEditTemplate from '@/components/AppViews/AppviewComponents/AppviewTagedit.vue'

import { ListIcon, Task } from '../../../interfaces/app'

const taskVuex = namespace('task')

@Component({
  components: {
    'task-edit': TaskEditTemplate,
  },
})
export default class TaskAdder extends Vue {
  @Prop() fixedTag!: string
  @Prop({default: false}) allowPriority!: boolean

  showing: boolean = false

  enter(obj: {value: string, priority: string}) {
    this.$emit('enter', obj)
  }
}

</script>

<style scoped>

.msg {
  height: 25px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.msg:hover .name, .msg:hover .icon {
  color: #FF6B66;
}

.name {
  margin-left: 12px;
}

</style>
