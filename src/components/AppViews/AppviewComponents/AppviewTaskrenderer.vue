<template>
  <div>
    <transition-group name='fade'>
      <view-task v-for='task in tasks'
        :key='task.id'
        :task='task'
      />
    </transition-group>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

import ViewTask from '@/components/AppViews/AppviewComponents/AppviewTask.vue'

import { Task } from '../../../interfaces/app'

@Component({
  components: {
    'view-task': ViewTask,
  },
})
export default class AppviewTaskrenderer extends Vue {
  @Prop(Array) tasks!: Task[]
}

</script>

<style scoped>

</style>
