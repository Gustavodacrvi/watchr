<template>
  <div class='component' v-if='pers'>
    <div class='header' :class='{pointer: !isDesktop}' @dblclick='toggleHide'>
      <header-title
        :value='pers.name'
        :icon='pers.icon'
        :icon-color='pers.iconColor'
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
    <div v-if='sort && sort.length > 0' class='margin'></div>
    <div v-if='!hided'>
      <div>
        <p v-if='pers.description' class='description txt' :class='theme'>
          {{ pers.description }}
        </p>
        <div v-if='pers.description' class='margin'></div>
        <view-tags
          :search='search'
          :priority='pers.priority'
          :labels='getLabels'
          :dates='dates'
          :smart-pers='smartPers'
          @clearsearch="v => search = ''"
          @clearpriority="selectPriority('')"
          @removelabel='removeLabel'
          @removedate='removeDate'
          @removesmartpers='removeSmartPers'
        />
        <div v-if="atLeastOneViewTag" class="margin"></div>
      </div>
      <task-renderer v-if='!calendarRenderer'
        id='appnavalltasks'
        :tasks='getTasks'
        :fixed-pers='pers.name'
        :default-priority='pers.priority'
        :default-labels='pers.includeAndLabels'
        :default-date='defaultDate'
        :allow-priority='true'
        :allow-project='true'
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
              :default-priority='pers.priority'
              :default-labels='getLabels'
              :default-date='defaultDate'
              :insert-before='true'
              :fix-adder-position='true'
              :allow-priority='true'
              :allow-project='true'
              :allow-date='true'
              :allow-labels='true'
              :always-show-last-edit-date='pers.alwaysShowLastEditDate'
              :always-show-creation-date='pers.alwaysShowCreationDate'
              :always-show-task-labels='pers.alwaysShowTaskLabels'
              @savenewdates='saveNewTaskDates'
              @selected='onSelect'
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

import { Component, Vue, Watch, Prop, Mixins } from 'vue-property-decorator'
import { State, Getter, Mutation, namespace } from 'vuex-class'
import PersMixin from '@/mixins/perspective'

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'
import EmptyTagsRenderer from '@/components/AppViews/AppviewComponents/AppviewEmptytagrenderer.vue'
import AppviewHeaderIcons from '@/components/AppViews/AppviewComponents/AppviewHeadericons.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/Tasks/AppviewTaskrenderer.vue'
import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'
import AppviewHeader from '@/components/AppViews/AppviewComponents/Headings/AppviewHeading.vue'

import timezone from 'moment-timezone'

import { Perspective, Label, Task, ListIcon, Alert, Project } from '../../../interfaces/app'
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
export default class PerspectiveAppview extends Mixins(PersMixin) {
  @Mutation pushAlert!: IndexMutations.PushAlert

  @taskVuex.Action addTaskPerspective!: TaskActions.AddTaskPerspective

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

  @Prop({default: true, type: Boolean}) allowLabels!: boolean
  @Prop({default: true, type: Boolean}) allowDate!: boolean
  @Prop({default: true, type: Boolean}) allowProject!: boolean
  @Prop(Boolean) calendarRenderer!: boolean
  @Prop(String) persName!: string
  @Prop(Array) baseTasks!: Task[]

  order: string[] = []
  justUpdated: boolean = false

  created() {
    this.updateView()
  }

  addLabel(label: Label) {
    this.addLabelToPerspective({
      id: this.pers.id,
      labelId: label.id,
    })
  }
  selectDate(date: string) {
    this.addDateToPerspective({
      id: this.pers.id,
      date,
    })
  }
  addSmartPers(name: string) {
    this.addSmartPersFilter({
      id: this.pers.id,
      persName: name,
    })
  }
  removeLabel(id: string) {
    this.removeLabelFromPerspective({
      id: this.pers.id,
      labelId: id,
    })
  }
  removeDate(date: string) {
    this.removeDateFromPerspective({
      id: this.pers.id,
      date,
    })
  }
  removeSmartPers(name: string) {
    this.removeSmartPersFilter({
      id: this.pers.id,
      persName: name,
    })
  }
  // tslint:disable-next-line:max-line-length
  addPersTask(obj: {name: string, priority: string, position: number, labels: string[], order: string[], utc: any, projectId: string}) {
    this.addTaskPerspective({
      task: {
        name: obj.name,
        priority: obj.priority,
        projectId: obj.projectId,
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
    this.savePerspectivePriority({
      id: this.pers.id,
      priority: value,
    })
  }
  saveNewSortOrder(names: string[]) {
    this.savePerspectiveTaskSort({
      sort: names,
      perspectiveId: this.pers.id,
    })
  }
  selectSettingsOption(value: string) {
    if (!this.sort.find(el => el === value))
      this.addPerspectiveSort({
        sort: value,
        perspectiveId: this.pers.id,
      })
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
  updateView() {
    if (this.pers) {
      this.priority = this.pers.priority
      if (!this.justUpdated) {
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
    tasks = this.filterTasks(tasks)
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
  get defaultDate(): string | undefined {
    if (!this.pers) return undefined
    if (this.pers.name === 'Today')
      return timezone().format('Y-M-D')
    if (this.pers.name === 'Tomorrow')
      return timezone().add(1, 'd').format('Y-M-D')
    return undefined
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
