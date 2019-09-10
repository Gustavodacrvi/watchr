<template>
  <div>
    <appnav-header
      name='PROJECTS'
      :show-title='true'
      :icons='[]'
      :selected='[]'
    />
    <appnav-renderer v-if='sortedFolders && sortedFolders.length > 0'
      group='appnavdivisionprojects'
      :list='getFoldersList'
      :icons='folderOptions'
      :active='activePers'
      :options='getProjectOptions'
      :help-icons='getProjectHelpIcons'
      @update='foldersOrder'
      @move='updateFoldersMove'
    />
    <appnav-message v-else @click='pushPopUp("AddFolderPopup")' name='Add folder'/>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Mutation, namespace, Getter } from 'vuex-class'

import AppnavRenderer from '@/components/TheAppBar/AppnavComponents/ListAppnavdivision.vue'
import AppnavHeader from '@/components/TheAppBar/AppnavComponents/AppnavHeader.vue'
import AppnavMessage from '@/components/TheAppBar/AppnavComponents/AppnavAddmessage.vue'
import AppnavDivision from '@/components/TheAppBar/AppnavComponents/AppnavDivision.vue'

// tslint:disable-next-line:max-line-length
import { Label, Perspective, Task, ListIcon, ListElement, AppnavDivisionEl, SimpleAdder, Project } from '@/interfaces/app'
import { IndexState, IndexMutations } from '../../../interfaces/store/index'
import { PersGetters } from '../../../interfaces/store/perspective'
import { TaskState, TaskActions, TaskGetters } from '../../../interfaces/store/task'
import { SetState } from '../../../interfaces/store/settings'
import { ProjectGetters, ProjectActions, ProjectState } from '../../../interfaces/store/project'

import appUtils from '@/utils/app'

const set = namespace('settings')
const task = namespace('task')
const projectVuex = namespace('project')

@Component({
  components: {
    'appnav-renderer': AppnavRenderer,
    'appnav-header': AppnavHeader,
    'appnav-message': AppnavMessage,
    'app-division': AppnavDivision,
  },
})
export default class OverviewAppnav extends Vue {
  @State viewName!: IndexState.viewName
  @State viewType!: IndexState.viewType
  @Mutation openSection!: IndexMutations.OpenSection
  @Mutation pushPopUp!: IndexMutations.PushPopUp
  @Mutation pushPopUpPayload!: IndexMutations.PushPopUpPayload
  @Mutation pushCenteredCard!: IndexMutations.PushCenteredCard

  @projectVuex.State projects!: ProjectState.projects
  @projectVuex.Getter sortedFolders!: ProjectGetters.SortedFolders
  @projectVuex.Getter getProjectsByFolderId!: ProjectGetters.GetProjectsByFolderId
  @projectVuex.Action deleteFolderAndProjectsByFolderId!: ProjectActions.DeleteFolderAndProjectsByFolderId
  @projectVuex.Action editFolderNameById!: ProjectActions.EditFolderNameById
  @projectVuex.Action saveFoldersOrder!: ProjectActions.SaveFoldersOrder
  @projectVuex.Action moveProjectsFromFolder!: ProjectActions.MoveProjectsFromFolder
  @projectVuex.Action toggleProjectPin!: ProjectActions.ToggleProjectPin
  @projectVuex.Action deleteProjectById!: ProjectActions.DeleteProjectById

  @task.State tasks!: TaskState.tasks
  @task.Getter getTasksByIds!: TaskGetters.GetTasksByIds

  @set.State timeZone!: SetState.timeZone

  @Prop(String) search!: string

  created() {
    this.openSection('overview')
  }
  foldersOrder(ids: string[]) {
    this.saveFoldersOrder(ids)
  }
  updateFoldersMove(obj: {to: string, from: string, ids: string[]}) {
    this.moveProjectsFromFolder(obj)
  }
  getProjectOptions(pro: Project) {
    const icons: ListIcon[] = [
      {
        name: 'Pin project',
        icon: 'thumbtack',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          this.toggleProjectPin(id)
        },
      },
      {
        name: 'Edit project',
        icon: 'edit',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          const project = this.projects.find(el => el.id === id)
          if (project) {
            this.pushPopUp('AddProjectPopup')
            this.pushPopUpPayload({id, editing: true, name: project.name})
          }
        },
      },
      {
        name: 'Delete project',
        icon: 'trash',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          const p = this.projects.find(el => el.id === id)
          if (p) {
            const ord = appUtils.fixOrder(this.tasks, p.tasks, true)
            const headingTasks = []
            for (const head of p.headings) {
              const order = appUtils.fixOrder(this.tasks, head.tasks, true)
              headingTasks.push(order)
            }
            this.deleteProjectById({
              projectId: id,
              projectTasks: ord,
              headings: headingTasks,
            })
          }
        },
      },
    ]
    if (pro.bindOnOverview)
      icons[0].name = 'Unpin project'
    return icons
  }
  getProjectHelpIcons(pro: Project) {
    const icons: ListIcon[] = []
    if (pro.bindOnOverview)
      icons.push({
        icon: 'thumbtack',
        iconColor: '',
        name: '',
        size: 'xs',
      })
    return icons
  }

  get folderOptions(): ListIcon[] {
    return [
      {
        name: 'Add project',
        icon: 'project-diagram',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          const fold = this.sortedFolders.find(el => el.id === id)
          if (fold) {
            this.pushPopUp('addProjectPopup')
            this.pushPopUpPayload(fold.name)
          }
        },
      },
      {
        name: 'Edit folder',
        icon: 'edit',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          const fold = this.sortedFolders.find(el => el.id === id)
          if (fold) {
            this.pushPopUp('SimpleadderPopup')
            this.pushPopUpPayload({
              buttonName: 'Save',
              popUpTitle: 'Edit folder name',
              inputPlaceholder: fold.name,
              inputMaximumCharacters: 50,
              callback: input => {
                this.editFolderNameById({
                  name: input,
                  id,
                })
                this.pushPopUp('')
              },
            } as SimpleAdder)
          }
        },
      },
      {
        name: 'Delete folder',
        icon: 'trash',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          this.pushCenteredCard({
            type: 'Component',
            flexBasis: '475px',
            payload: 'The folder and all of the projects in it will be <strong>Deleted</strong>.',
            listIcons: [],
            listIconHandler: (confirm: boolean) => {
              if (confirm)
                this.deleteFolderAndProjectsByFolderId(id)
            },
            compName: 'Confirm',
          })
        },
      },
    ]
  }
  get getFoldersList(): AppnavDivisionEl[] {
    const fs = this.sortedFolders
    const arr: AppnavDivisionEl[] = []
    for (const f of fs) {
      const pros = this.getProjectsByFolderId(f.id)
      const list = []

      for (const p of pros) {
        const isInThisProject = (givenTask: Task) => {
          return givenTask.projectId && givenTask.projectId === p.id
        }

        let tasks = this.getTasksByIds(p.tasks)
        tasks = tasks.filter(el => isInThisProject(el))

        for (const head of p.headings) {
          let headTasks = this.getTasksByIds(head.tasks)
          headTasks = headTasks.filter(el => isInThisProject(el))
          tasks = [...tasks, ...headTasks]
        }
        const numberOfTasks = tasks.length
        let completedTasks = 0

        for (const t of tasks)
          if (t.completed) completedTasks++

        let progress = 100 * completedTasks / numberOfTasks
        if (numberOfTasks === 0) progress = 0

        list.push({
          ...p,
          number: 0,
          progress,
          show: true,
        })
      }
      arr.push({
        name: f.name,
        id: f.id,
        list,
      })
    }
    return arr
  }
  get activePers(): string {
    if (this.viewType === 'project')
      return this.viewName
    return ''
  }
}

</script>
