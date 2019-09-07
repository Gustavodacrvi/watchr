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
        :number='0'
        @update='onUpdate'
        @selected='updateSelected'
        @add='addTask'
        @addheading='addHeading'
        @delete='deleteTask'
      />
      <div style="height: 45px;"></div>
      <headings-render
        id='appnavprojecttasks'
        :headings='getHeadings'
        :header-options='headerOptions'
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
        @selected='updateSelectedHeading'
        @add='addTaskInProjectHeading'
        @updateheadings='updateHeadings'
        @update='updateHeadingTasks'
        @delete='deleteHeadingTask'
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

import { Project, Label, Task, ListIcon } from '@/interfaces/app'
import { ProjectActions, ProjectGetters } from '../../../interfaces/store/project'
import { TaskGetters, TaskActions } from '../../../interfaces/store/task'
import HeadingsRenderer from '../AppviewComponents/Headings/HeadingsRenderer.vue'

@Component({
  components: {
    'header-title': HeaderTitle,
    'view-header-icons': AppviewHeaderIcons,
    'task-renderer': AppviewTaskrenderer,
    'view-tags': AppviewTags,
    'headings-render': HeadingsRenderer,
  },
})
export default class ProjectAppview extends Mixins(PersMixin) {
  @prjVuex.Getter getProjectByName!: ProjectGetters.GetProjectByName
  @prjVuex.Getter getProjectById!: ProjectGetters.GetProjectById
  @prjVuex.Action deleteProjectTask!: ProjectActions.DeleteProjectTask
  @prjVuex.Action updateProjectTasks!: ProjectActions.UpdateProjectTasks
  @prjVuex.Action addProjectHeadings!: ProjectActions.AddProjectHeadings
  @prjVuex.Action deleteHeadingById!: ProjectActions.DeleteHeadingById
  @prjVuex.Action updateHeadingsOrder!: ProjectActions.UpdateHeadingsOrder
  @prjVuex.Action updateHeadingsTaskOrder!: ProjectActions.UpdateHeadingsTaskOrder
  @prjVuex.Action addProjectHeadingTask!: ProjectActions.AddProjectHeadingTask
  @prjVuex.Action deleteProjectHeadingTasks!: ProjectActions.DeleteProjectHeadingTasks

  @task.Getter getTasksByIds!: TaskGetters.GetTasksByIds
  @task.Action addProjectTask!: TaskActions.AddProjectTask

  @Prop(String) project!: string

  created() {
    this.updateView()
  }

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
  addTaskInProjectHeading(obj: {name: string, priority: string, position: number, labels: string[], order: string[], utc: any, parentId: string}) {
    if (this.prj) {
      const p = this.prj as Project
      this.addProjectHeadingTask({
        task: {
          name: obj.name,
          priority: obj.priority,
          labels: obj.labels,
          utc: obj.utc,
        },
        headingId: obj.parentId,
        projectId: p.id,
        position: obj.position,
        order: obj.order,
      } as any)
    }
  }
  onUpdate(ids: string[]) {
    if (this.prj)
      this.updateProjectTasks({
        id: this.prj.id,
        ids,
      })
  }
  updateHeadingTasks(obj: {ids: string[], parentId: string}) {
    if (this.prj)
      this.updateHeadingsTaskOrder({
        projectId: this.prj.id,
        ids: obj.ids,
        headingId: obj.parentId,
      })
  }
  updateHeadings(ids: string[]) {
    if (this.prj)
      this.updateHeadingsOrder({
        projectId: this.prj.id,
        ids,
      })
  }
  addHeading({ids, position, name}: {ids: string[], position: number, name: string}) {
    if (this.prj)
      this.addProjectHeadings({
        name, ids,
        index: position,
        id: this.prj.id,
      })
  }
  deleteHeadingTask(obj: {parentId: string, taskId: string}) {
    if (this.prj)
      this.deleteProjectHeadingTasks({
        projectId: this.prj.id,
        headingId: obj.parentId,
        taskIds: [obj.taskId],
      })
  }
  deleteTask({taskId}: {taskId: string, parentId: string}) {
    if (this.prj)
      this.deleteProjectTask({
        taskId, projectId: this.prj.id,
      })
  }
  updateSelected(ids: string[]) {
    console.log(ids)
    if (this.prj)
      this.onSelect(ids, this.prj.id, 'project')
  }
  updateSelectedHeading({parentId, ids}: {parentId: string, ids: string[]}) {
    if (this.prj)
      this.onSelect(ids, {projectId: this.prj.id, headingId: parentId}, 'projectheading')
  }
  updateView() {
    if (this.prj)
      this.pushView({
        view: this.prj.name,
        viewType: 'project',
      })
  }

  get getTasks(): Task[] {
    if (this.prj)
      return this.filterTasks(this.getTasksByIds(this.prj.tasks))
    return []
  }
  get headerOptions(): ListIcon[] {
    if (this.prj) {
      const project = this.prj as Project
      return [
        {
          name: 'Delete heading',
          icon: 'trash',
          iconColor: '',
          size: 'lg',
          callback: (id: string) => {
            this.deleteHeadingById({
              projectId: project.id,
              headingId: id,
            })
          },
        },
      ]
    }
    return []
  }
  get getHeadings(): Array<{id: string, name: string, tasks: Task[]}> {
    const arr: Array<{id: string, name: string, tasks: Task[]}> = []

    if (this.prj)
      for (const head of this.prj.headings)
        arr.push({
          id: head.id,
          name: head.name,
          tasks: this.getTasksByIds(head.tasks),
        })

    return arr
  }
  get getLabels(): Label[] {
    return this.getLabelsByIds(this.labels)
  }
  get prj(): Project | undefined {
    return this.getProjectByName(this.project)
  }

  @Watch('prj')
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
