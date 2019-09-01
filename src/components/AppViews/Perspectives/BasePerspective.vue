<template>
  <div class='component' v-if='pers'>
    <div class='header' :class='{pointer: !isDesktop}' @dblclick='toggleHide'>
      <header-title
        :value='pers.name'
        :icon='pers.icon'
        :icon-color='pers.iconColor'
        :showing='showing'
        @toggle='v => showing = !showing'
      />
      <div class='right'>
        <view-header-icons v-if='pers'
          v-model='search'
          :pers-name='pers.name'
          :allow-search='true'
          :allow-settings='!calendarRenderer'
          :allow-labels='allowLabels'
          :allow-dates='allowDate'
          :allow-smart-perspectives='true'
          :allow-priority='true'

          @priority='selectPriority'
          @settings='selectSettingsOption'
          @date='selectDate'
          @label='addLabel'
          @smartpers='addSmartPers'
        />
      </div>
    </div>
    <div class='margin'></div>
    <empty-tag-renderer v-if='sort && sort.length > 0'
      :list='sort'
      @update='saveNewSortOrder'
    />
    <div class='margin'></div>
    <div v-if='!hided'>
      <div v-if='showing'>
        <p v-if='pers.description' class='description txt' :class='theme'>
          {{ pers.description }}
        </p>
        <div v-if='pers.description' class='margin'></div>
        <view-tags
          :fixed-tag='fixedTag'
          :search='search'
          :priority='getPriority'
          :labels='getLabels'
          :dates='dates'
          :smart-pers='smartPers'
          @clearsearch="v => search = ''"
          @clearpriority="selectPriority('')"
          @removelabel='removeLabel'
          @removedate='removeDate'
          @removesmartpers='removeSmartPers'
        />
        <div class='margin'></div>
      </div>
      <task-renderer v-if='!calendarRenderer'
        id='appnavalltasks'
        :tasks='getTasks'
        :fixed-pers='pers.name'
        :default-priority='getPriority'
        :default-labels='defaultLabels'
        :default-date='defaultDate'
        :allow-priority='true'
        :allow-date='allowDate'
        :fix-adder-position='sort.length === 0'
        :insert-before='true'
        :always-show-last-edit-date='pers.alwaysShowLastEditDate'
        :always-show-creation-date='pers.alwaysShowCreationDate'
        :always-show-task-labels='pers.alwaysShowTaskLabels'
        :allow-labels='allowLabels'
        @update='onUpdate'
        @selected='onSelect'
        @add='addPersTask'
      />
      <div v-else>
        <template v-if='headingsTasks.length > 0'>
          <app-header v-for='tasks in headingsTasks'
            :key='tasks[0].date'
            :obj='beautifyDate(tasks[0].date)'
          >
            <task-renderer
              id='appnavalltasks'
              list-type='date'
              :date='tasks[0].date'
              :list-has-dates='true'
              :tasks='tasks'
              :default-priority='getPriority'
              :default-labels='defaultLabels'
              :default-date='defaultDate'
              :allow-priority='true'
              :insert-before='true'
              :allow-date='true'
              :fix-adder-position='true'
              :allow-labels='true'
              :always-show-last-edit-date='pers.alwaysShowLastEditDate'
              :always-show-creation-date='pers.alwaysShowCreationDate'
              :always-show-task-labels='pers.alwaysShowTaskLabels'
              @savenewdates='saveNewTaskDates'
              @add='addPersTask'
            />
          </app-header>
        </template>
        <div v-else class='headings-error gray round-border' :class='theme'>
          <span class='txt' :class='theme'>You have no upcoming tasks!</span>
        </div>
      </div>
    </div>
    <div class='margin-task' :class='platform'></div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { State, Getter, Mutation, namespace } from 'vuex-class'

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'
import EmptyTagsRenderer from '@/components/AppViews/AppviewComponents/AppviewEmptytagrenderer.vue'
import AppviewHeaderIcons from '@/components/AppViews/AppviewComponents/AppviewHeadericons.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/Tasks/AppviewTaskrenderer.vue'
import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'
import AppviewHeader from '@/components/AppViews/AppviewComponents/Headings/AppviewHeading.vue'

import timezone from 'moment-timezone'

import { Perspective, Label, Task, ListIcon, Alert } from '../../../interfaces/app'
import appUtils from '@/utils/app'
import { IndexState, IndexGetters, IndexMutations } from '../../../interfaces/store/index'
import { LabelGetters } from '../../../interfaces/store/label'
import { PersGetters, PersActions } from '../../../interfaces/store/perspective'
import { SetState } from '../../../interfaces/store/settings'
import { TaskState, TaskActions } from '../../../interfaces/store/task'

const labelVuex = namespace('label')
const taskVuex = namespace('task')
const persVuex = namespace('perspective')
const set = namespace('settings')

@Component({
  components: {
    'view-tags': AppviewTags,
    'task-renderer': AppviewTaskrenderer,
    'view-header-icons': AppviewHeaderIcons,
    'header-title': HeaderTitle,
    'app-header': AppviewHeader,
    'empty-tag-renderer': EmptyTagsRenderer,
  },
})
export default class PerspectiveAppview extends Vue {
  @State theme!: IndexState.theme
  @State selectedTasks!: IndexState.selectedTasks
  @State currentAppSection!: IndexState.currentAppSection
  @Getter isDesktop!: IndexGetters.IsDesktop
  @Getter platform!: IndexGetters.Platform
  @Mutation pushView!: IndexMutations.PushView
  @Mutation sendOptionsToNavbar!: IndexMutations.SendOptionsToNavbar
  @Mutation hideNavBarOptions!: IndexMutations.HideNavBarOptions
  @Mutation pushAlert!: IndexMutations.PushAlert
  @Mutation pushPopUp!: IndexMutations.PushPopUp
  @Mutation pushPopUpPayload!: IndexMutations.PushPopUpPayload
  @Mutation updateSelectedTasks!: IndexMutations.UpdateSelectedTasks
  @Mutation pushCenteredCard!: IndexMutations.PushCenteredCard

  @taskVuex.State tasks!: TaskState.tasks
  @taskVuex.Action addTaskPerspective!: TaskActions.AddTaskPerspective
  @taskVuex.Action deleteTasksById!: TaskActions.DeleteTasksById
  @taskVuex.Action changePrioritysByIds!: TaskActions.ChangePrioritysByIds
  @taskVuex.Action saveNewDateOfTasks!: TaskActions.SaveNewDateOfTasks

  @labelVuex.Getter getLabelsByIds!: LabelGetters.GetLabelsByIds

  @persVuex.Getter getPerspectiveByName!: PersGetters.GetPerspectiveByName
  @persVuex.Action saveTaskOrder!: PersActions.SaveTaskOrder
  @persVuex.Action addSmartPersFilter!: PersActions.AddSmartPersFilter
  @persVuex.Action removeSmartPersFilter!: PersActions.RemoveSmartPersFilter
  @persVuex.Action addLabelToPerspective!: PersActions.AddLabelToPerspective
  @persVuex.Action removeLabelFromPerspective!: PersActions.RemoveLabelFromPerspective
  @persVuex.Action savePerspectivePriority!: PersActions.SavePerspectivePriority
  @persVuex.Action addPerspectiveSort!: PersActions.AddPerspectiveSort
  @persVuex.Action savePerspectiveTaskSort!: PersActions.SavePerspectiveTaskSort
  @persVuex.Action addDateToPerspective!: PersActions.AddDateToPerspective
  @persVuex.Action removeDateFromPerspective!: PersActions.RemoveDateFromPerspective

  @set.State timeZone!: SetState.timeZone
  @set.State startOfTheWeek!: SetState.startOfTheWeek

  @Prop({default: true, type: Boolean}) allowLabels!: boolean
  @Prop({default: true, type: Boolean}) allowDate!: boolean
  @Prop(Boolean) save!: boolean
  @Prop(Boolean) saveSort!: boolean
  @Prop(Boolean) calendarRenderer!: boolean
  @Prop(String) persName!: string
  @Prop(Object) fixedTag!: object
  @Prop(Array) baseTasks!: Task[]

  search: string = ''
  priority: string = ''
  labels: string[] = []
  dates: string[] = []
  smartPers: string[] = []
  sort: string[] = []
  order: string[] = []
  hided: boolean = false
  showing: boolean = true
  justUpdated: boolean = false
  mobileSelectedOptions: ListIcon[] = [
    {
      name: 'Delete selected tasks',
      icon: 'trash',
      iconColor: '',
      size: '',
    },
    {
      name: 'Change priority of tasks',
      icon: 'exclamation',
      iconColor: '',
      size: '',
    },
    {
      name: 'Change date of tasks',
      icon: 'calendar-day',
      iconColor: '',
      size: '',
    },
    {
      name: 'Add labels to tasks',
      icon: 'tag',
      iconColor: '',
      size: '',
    },
  ]

  created() {
    this.updateView()
  }

  getMobileSelectedOptions(): ListIcon[] {
    this.mobileSelectedOptions[0]['callback'] = () => {
      this.deleteTasksById(this.selectedTasks)
    }
    this.mobileSelectedOptions[1]['callback'] = () => {
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
    }
    this.mobileSelectedOptions[2]['callback'] = () => {
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
    }
    this.mobileSelectedOptions[3]['callback'] = () => {
      setTimeout(() => {
        this.pushPopUp('AddLabelsToTasksPopup')
        this.pushPopUpPayload(this.selectedTasks)
      }, 80)
    }
    return this.mobileSelectedOptions
  }
  addLabel(label: Label) {
    if (!this.save && !this.labels.find(el => el === label.id))
      this.labels.push(label.id)
    else if (this.save) this.addLabelToPerspective({
        id: this.pers.id,
        labelId: label.id,
      })
  }
  selectDate(date: string) {
    if (!this.save && !this.dates.find(el => el === date))
      this.dates.push(date)
    else if (this.save) this.addDateToPerspective({
      id: this.pers.id,
      date,
    })
  }
  addSmartPers(name: string) {
    if (!this.save && !this.smartPers.find(el => el === name))
      this.smartPers.push(name)
    else if (this.save) this.addSmartPersFilter({
        id: this.pers.id,
        persName: name,
      })
  }
  removeLabel(id: string) {
    if (!this.save) {
      const index = this.labels.findIndex(el => el === id)
      this.labels.splice(index, 1)
    } else this.removeLabelFromPerspective({
        id: this.pers.id,
        labelId: id,
      })
  }
  removeDate(date: string) {
    if (!this.save) {
      const index = this.dates.findIndex(el => el === date)
      this.dates.splice(index, 1)
    } else this.removeDateFromPerspective({
      id: this.pers.id,
      date,
    })
  }
  removeSmartPers(name: string) {
    if (!this.save) {
      const index = this.smartPers.findIndex(el => el === name)
      this.smartPers.splice(index, 1)
    } else this.removeSmartPersFilter({
        id: this.pers.id,
        persName: name,
      })
  }
  addPersTask(obj: {name: string, priority: string, position: number, labels: string[], order: string[], utc: any}) {
    this.addTaskPerspective({
      task: {
        name: obj.name,
        priority: obj.priority,
        labels: obj.labels,
        utc: obj.utc,
      },
      perspectiveId: this.pers.id,
      position: obj.position, order: obj.order,
    } as any)
    this.pushAlert({
      name: 'The task was successfully added.',
      duration: 1.5,
      type: 'success',
    })
  }
  selectPriority(value: string) {
    if (!this.save)
      this.priority = value
    else this.savePerspectivePriority({
        id: this.pers.id,
        priority: value,
      })
  }
  saveNewSortOrder(names: string[]) {
    this.sort = names
    if (this.saveSort)
      this.savePerspectiveTaskSort({
        sort: names,
        perspectiveId: this.pers.id,
      })
  }
  selectSettingsOption(value: string) {
    if (!this.sort.find(el => el === value)) {
      this.sort.push(value)
      if (this.saveSort)
        this.addPerspectiveSort({
          sort: value,
          perspectiveId: this.pers.id,
        })
    }
  }
  toggleHide() {
    if (!this.isDesktop)
      this.hided = !this.hided
  }
  onUpdate(ids: string[]) {
    const filtered = ids.filter(el => el !== 'task-adder')
    if (!appUtils.arraysEqual(filtered, this.pers.order))
      this.saveTaskOrder({
        id: this.pers.id,
        order: ids.filter(el => el !== 'task-adder'),
      })
    this.justUpdated = true
  }
  onSelect(ids: string[]) {
    this.updateSelectedTasks(ids)
  }
  selectedDates(date: string) {
    const arr: Array<{id: string, date: string}> = []
    for (const id of this.selectedTasks)
      arr.push({id, date})
    if (arr.length > 0)
      this.saveNewDateOfTasks(arr)
  }
  updateView() {
    if (this.pers) {
      this.priority = this.pers.priority
      if (!this.justUpdated && !this.save || this.save) {
        this.labels = this.pers.includeAndLabels.slice()
        this.smartPers = this.pers.includeAndSmartPers.slice()
        this.sort = this.pers.sort.slice()
        this.order = this.pers.order.slice()
        this.dates = this.pers.includeAndDates.slice()
      }
      this.justUpdated = false
      this.pushView({
        view: this.pers.name,
        viewType: 'perspective',
      })
    }
  }
  saveNewTaskDates(arr: Array<{id: string, date: string}>) {
    this.saveNewDateOfTasks(arr)
  }
  beautifyDate(date: string): {name: string, faded?: string} {
    const today = timezone().tz(this.timeZone)
    const m = timezone.tz(`${date} ${timezone.utc().format('HH:mm')}`, 'Y-M-D HH:mm', 'UTC').tz(this.timeZone)
    const diff = m.diff(today, 'days')

    let name!: string
    let faded!: string
    const week = m.format('dddd')

    if (diff === 0) name = 'Tomorrow'
    else if (diff < 6) {
      name = week
      faded = m.format('D')
    } else if (m.isSame(today, 'month')) {
      name = m.format('D')
      faded = week
    } else if (m.isSame(today, 'year')) {
      name = m.format('D of MMMM')
      faded = week
    } else {
      name = m.format('LL')
      faded = week
    }

    return {name, faded}
  }

  get headingsTasks(): Task[][] {
    const hds = this.calendarHeadings
    const finalArr: Task[][] = []
    for (const date of hds) {
      const mom = timezone.tz(date, 'Y-M-D', 'UTC')
      const arr: Task[] = []
      for (const t of this.getTasks)
        if (mom.isSame(timezone.tz(t.date, 'Y-M-D', 'UTC')))
          arr.push(t)
      if (arr.length > 0) finalArr.push(arr)
    }
    return finalArr
  }
  get calendarHeadings(): string[] {
    const tks = this.getTasks
    const dates = new Set()
    for (const t of tks)
      if (!dates.has(t.date))
        dates.add(t.date)
    const arr: string[] = Array.from(dates) as any
    arr.sort((a, b) => {
      const ma = timezone.tz(a, 'Y-M-D', 'UTC')
      const mb = timezone.tz(b, 'Y-M-D', 'UTC')
      if (ma.isAfter(mb)) return 1
      return -1
    })
    return arr
  }
  get pers(): Perspective {
    return this.getPerspectiveByName(this.persName)
  }
  get viewTasks(): Task[] {
    return this.baseTasks
  }
  get sortedTasks(): Task[] {
    const ord = appUtils.fixOrder(this.viewTasks, this.pers.order)
    return appUtils.sortArrayByIds(this.viewTasks, ord)
  }
  get getTasks(): Task[] {
    let tasks: Task[] = this.sortedTasks
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
        if (name !== this.pers.name)
          tasks = appUtils.filterTasksBySmartPerspective(name, tasks, this.timeZone, this.startOfTheWeek)
    if (this.order && this.order.length > 0) {
      const ord = appUtils.fixOrder(tasks, this.order)
      tasks = appUtils.sortArrayByIds(tasks, ord)
    }
    if (this.sort && this.sort.length > 0)
      tasks = appUtils.sortTasksByMultipleCriteria(tasks, this.sort)
    return tasks
  }
  get getLabels(): Label[] {
    return this.getLabelsByIds(this.labels)
  }
  get getPriority(): string {
    if (!this.save)
      return this.priority
    else return this.pers.priority
  }
  get defaultLabels(): string[] {
    if (!this.save)
      return this.labels
    return this.pers.includeAndLabels
  }
  get defaultDate(): string | undefined {
    if (!this.pers) return undefined
    if (this.pers.name === 'Today')
      return timezone().format('Y-M-D')
    if (this.pers.name === 'Tomorrow')
      return timezone().add(1, 'd').format('Y-M-D')
    return undefined
  }

  @Watch('selectedTasks')
  onChange() {
    if (!this.isDesktop)
      if (this.selectedTasks.length > 0)
        this.sendOptionsToNavbar(this.getMobileSelectedOptions())
      else this.hideNavBarOptions()
  }
  @Watch('pers')
  onChange3() {
    this.updateView()
  }
  @Watch('currentAppSection')
  onChange6() {
    this.updateView()
  }
}

</script>

<style scoped>

.header {
  height: 30px;
}

.headings-error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 275px;
}

</style>

<style scoped src='@/assets/css/appView.css'>
</style>
