
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Mutation, State, Getter, namespace } from 'vuex-class'

const taskVuex = namespace('task')
const set = namespace('settings')

import { IndexState, IndexMutations, IndexGetters } from '@/interfaces/store'
import { TaskState, TaskActions } from '@/interfaces/store/task'
import { SetState } from '@/interfaces/store/settings'
import { ListIcon } from '@/interfaces/app';

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

  @Watch('selectedTasks')
  onChange() {
    if (!this.isDesktop)
      if (this.selectedTasks.length > 0)
        this.sendOptionsToNavbar(this.getMobileSelectedOptions())
      else this.hideNavBarOptions()
  }
}
