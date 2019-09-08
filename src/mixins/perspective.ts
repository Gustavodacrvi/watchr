
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Mutation, State, Getter, namespace } from 'vuex-class'

const taskVuex = namespace('task')
const set = namespace('settings')
const labelVuex = namespace('label')

import appUtils from '@/utils/app'

import { IndexState, IndexMutations, IndexGetters } from '@/interfaces/store'
import { TaskState, TaskActions } from '@/interfaces/store/task'
import { SetState } from '@/interfaces/store/settings'
import { ListIcon, Label, Task } from '@/interfaces/app'
import { LabelGetters } from '@/interfaces/store/label'

@Component
export default class NavbarMixin extends Vue {
  @State theme!: IndexState.theme
  @State selectedTasks!: IndexState.selectedTasks
  @State currentAppSection!: IndexState.currentAppSection
  @Getter isDesktop!: IndexGetters.IsDesktop
  @Getter platform!: IndexGetters.Platform
  @Mutation pushView!: IndexMutations.PushView
  @Mutation pushPopUp!: IndexMutations.PushPopUp
  @Mutation sendOptionsToNavbar!: IndexMutations.SendOptionsToNavbar
  @Mutation pushCenteredCard!: IndexMutations.PushCenteredCard
  @Mutation pushPopUpPayload!: IndexMutations.PushPopUpPayload
  @Mutation hideNavBarOptions!: IndexMutations.HideNavBarOptions
  @Mutation updateSelectedTasks!: IndexMutations.UpdateSelectedTasks

  @taskVuex.State tasks!: TaskState.tasks
  @taskVuex.Action deleteTasksById!: TaskActions.DeleteTasksById
  @taskVuex.Action changePrioritysByIds!: TaskActions.ChangePrioritysByIds
  @taskVuex.Action saveNewDateOfTasks!: TaskActions.SaveNewDateOfTasks

  @labelVuex.Getter getLabelsByIds!: LabelGetters.GetLabelsByIds

  @set.State timeZone!: SetState.timeZone
  @set.State startOfTheWeek!: SetState.startOfTheWeek

  search: string = ''
  priority: string = ''
  labels: string[] = []
  dates: string[] = []
  smartPers: string[] = []
  sort: string[] = []
  hided: boolean = false

  toggleHide() {
    if (!this.isDesktop)
      this.hided = !this.hided
  }
  addLabelNonSave(label: Label) {
    if (!this.labels.find(el => el === label.id))
      this.labels.push(label.id)
  }
  addDateNonSave(date: string) {
    if (!this.dates.find(el => el === date))
      this.dates.push(date)
  }
  removeLabelNonSave(id: string) {
    const index = this.labels.findIndex(el => el === id)
    this.labels.splice(index, 1)
  }
  removeDateNonSave(date: string) {
    const index = this.dates.findIndex(el => el === date)
    this.dates.splice(index, 1)
  }
  removeSmartPersNonSave(name: string) {
    const index = this.smartPers.findIndex(el => el === name)
    this.smartPers.splice(index, 1)
  }
  onSelect(ids: string[]) {
    this.updateSelectedTasks(ids)
  }
  addSmartPersNonSave(name: string) {
    if (!this.smartPers.find(el => el === name))
      this.smartPers.push(name)
  }
  getMobileSelectedOptions(): ListIcon[] {
    return [
      {
        name: 'Delete selected tasks',
        icon: 'trash',
        iconColor: '',
        size: '',
        callback: () => {
          this.deleteTasksById(this.selectedTasks)
        },
      },
      {
        name: 'Change priority of tasks',
        icon: 'exclamation',
        iconColor: '',
        size: '',
        callback: () => {
          setTimeout(() => {
            this.sendOptionsToNavbar([
              {
                name: 'High priority',
                icon: 'exclamation',
                iconColor: '#FF6B66',
                size: 'lg',
                callback: () => {
                  this.changePrioritysByIds({
                    ids: this.selectedTasks,
                    priority: 'High priority',
                  })
                  this.sendOptionsToNavbar([])
                },
              },
              {
                name: 'Medium priority',
                icon: 'exclamation',
                iconColor: '#fff566',
                size: 'lg',
                callback: () => {
                  this.changePrioritysByIds({
                    ids: this.selectedTasks,
                    priority: 'Medium priority',
                  })
                  this.sendOptionsToNavbar([])
                },
              },
              {
                name: 'Low priority',
                icon: 'exclamation',
                iconColor: '#70ff66',
                size: 'lg',
                callback: () => {
                  this.changePrioritysByIds({
                    ids: this.selectedTasks,
                    priority: 'Low priority',
                  })
                  this.sendOptionsToNavbar([])
                },
              },
            ])
          }, 80)
        },
      },
      {
        name: 'Change date of tasks',
        icon: 'calendar-day',
        iconColor: '',
        size: '',
        callback: () => {
          setTimeout(() => {
            this.pushCenteredCard({
              type: 'Component',
              compName: 'CalendarInput',
              flexBasis: '275px',
              listIcons: [],
              listIconHandler: (e: any) => {
                this.selectedDates(e.utc.date)
              },
            })
          }, 80)
        },
      },
      {
        name: 'Add labels to tasks',
        icon: 'tag',
        iconColor: '',
        size: '',
        callback: () => {
          setTimeout(() => {
            this.pushPopUp('AddLabelsToTasksPopup')
            this.pushPopUpPayload(this.selectedTasks)
          }, 80)
        },
      },
    ]
  }
  selectedDates(date: string) {
    const arr: Array<{id: string, date: string}> = []
    for (const id of this.selectedTasks)
      arr.push({id, date})
    if (arr.length > 0)
      this.saveNewDateOfTasks(arr)
  }
  filterTasks(tasks: Task[]): Task[] {
    if (this.search)
      tasks = tasks.filter(el => el.name.toLowerCase().includes(this.search.toLowerCase()))
    if (this.priority)
      tasks = appUtils.filterTasksByPriority(tasks, this.priority)
    if (this.labels && this.labels.length > 0)
      tasks = appUtils.filterTasksByLabels(tasks, this.labels)
    if (this.dates && this.dates.length > 0)
      tasks = appUtils.filterTasksByDates(tasks, this.dates, this.timeZone)
    if (this.smartPers && this.smartPers.length > 0)
      for (const name of this.smartPers)
        tasks = appUtils.filterTasksBySmartPerspective(name, tasks, this.timeZone, this.startOfTheWeek)
    return tasks
  }

  @Watch('selectedTasks')
  onChange() {
    if (!this.isDesktop)
      if (this.selectedTasks.length > 0)
        this.sendOptionsToNavbar(this.getMobileSelectedOptions())
      else this.hideNavBarOptions()
  }
}
