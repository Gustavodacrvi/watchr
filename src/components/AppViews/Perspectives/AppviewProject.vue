<template>
  <div class='component' v-if='prj'>
    <div :class="{pointer: !isDesktop}" @dblclick="toggleHide" class="header">
      <header-title
        :value='prj.name'
        icon=''
        icon-color=''
      />
      <div class="right">
        <view-header-icons
          v-model="search"
          :pers-name='prj.name'
          :allow-search='true'
          :allow-settings='false'
          :allow-labels='true'
          :allow-dates='true'
          :allow-smart-perspectives='true'
          :allow-priority='true'

          @priority='v => priority = v'
          @label='addLabelNonSave'
          @date='addDateNonSave'
          @smartpers='addSmartPersNonSave'
        />
      </div>
    </div>
    <div class='margin'></div>
    <div v-if="!hided">
      <div>
        <p v-if='prj.description' class='description txt' :class='theme'>
          {{ prj.description }}
        </p>
        <div v-if='prj.description' class='margin'></div>
        <view-tags
          :search='search'
          :labels='labels'
          :priority='priority'
          :dates='dates'
          :smart-pers='smartPers'
          @clearsearch='v => search = ""'
          @clearpriority='v => priority = ""'
          @removelabel='removeLabelNonSave'
          @removedate='removeDateNonSave'
          @removesmartpers='removeSmartPersNonSave'
        />
      </div>
      <task-renderer
        id='appnavproject'
        :tasks='getTasks'
        :default-priority='priority'
        :default-labels='getLabels'
        :allow-priority='true'
        :fix-adder-position='true'
        :insert-before='true'
        :always-show-last-edit-date='false'
        :always-show-creation-date='false'
        :always-show-task-labels='false'
        :allow-labels='true'
        :allow-date='true'
        :emit-complete-task='true'
        @update='onUpdate'
        @selected='onSelect'
        @add='addTask'
        @complete='completeTask'
        @delete='deleteTask'
      />
    </div>
    <div class='margin-task' :class='platform'></div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Mixins, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import PersMixin from '@/mixins/perspective'

const task = namespace('task')
const prjVuex = namespace('project')

import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'
import AppviewHeaderIcons from '@/components/AppViews/AppviewComponents/AppviewHeadericons.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/Tasks/AppviewTaskrenderer.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'

import appUtils from '@/utils/app'

import { Project, Label, Task } from '@/interfaces/app'
import { ProjectActions, ProjectGetters } from '../../../interfaces/store/project'
import { TaskGetters, TaskActions } from '../../../interfaces/store/task'

@Component({
  components: {
    'header-title': HeaderTitle,
    'view-header-icons': AppviewHeaderIcons,
    'task-renderer': AppviewTaskrenderer,
    'view-tags': AppviewTags,
  },
})
export default class ProjectAppview extends Mixins(PersMixin) {
  @prjVuex.Getter getProjectByName!: ProjectGetters.GetProjectByName
  @prjVuex.Action completeProjectTask!: ProjectActions.CompleteProjectTask
  @prjVuex.Action deleteProjectTask!: ProjectActions.DeleteProjectTask

  @task.Getter getTasksByIds!: TaskGetters.GetTasksByIds
  @task.Action addProjectTask!: TaskActions.AddProjectTask

  @Prop(String) project!: string

  addTask(obj: {name: string, priority: string, position: number, labels: string[], order: string[], utc: any}) {
    if (this.prj) {
      const p = this.prj as Project
      this.addProjectTask({
        task: {
          name: obj.name,
          priority: obj.priority,
          labels: obj.labels,
          utc: obj.utc,
        },
        projectId: p.id,
        position: obj.position,
        order: p.tasks,
      } as any)
    }
  }
  onUpdate(obj: any) {
    console.log('onUpdateProjectTask', obj)
  }
  completeTask(task: Task) {
    if (this.prj)
      this.completeProjectTask({
        task, projectId: this.prj.id,
      })
  }
  deleteTask(taskId: string) {
    if (this.prj)
      this.deleteProjectTask({
        taskId, projectId: this.prj.id,
      })
  }
  updateView() {
    if (this.prj)
      this.pushView({
        view: this.prj.name,
        viewType: 'project',
      })
  }

  get getTasks(): Task[] {
    console.log(this.prj)
    if (this.prj)
      return this.filterTasks(this.getTasksByIds(this.prj.tasks))
    return []
  }
  get getLabels(): Label[] {
    return this.getLabelsByIds(this.labels)
  }
  get prj(): Project | undefined {
    return this.getProjectByName(this.project)
  }

  @Watch('label')
  onChange3() {
    this.updateView()
  }
  @Watch('currentAppSection')
  onChange6() {
    this.updateView()
  }
}

</script>

<style scoped src='@/assets/css/appView.css'>
</style>
