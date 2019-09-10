<template>
  <div class='task-adder'>
    <div class='view-tags'>
      <transition name='fade'>
        <view-tags v-if='priority || fixedPers || getLabels.length > 0 || calendarString || project'
          :fixed-pers='fixedPers'
          :fixed-label='fixedLabel'
          :priority='priority'
          :project='project'
          :labels='getLabels'
          :calendar='calendarString'
          @clearpriority="v => priority = ''"
          @clearproject="v => project = null"
          @removelabel='removeLabel'
          @removecalendar='removeCalendar'
        />
      </transition>
    </div>
    <div class='margin input-div'>
      <drop-input
        tabindex='1'
        focus-class='taskedit'
        :input-theme='inputTheme ? inputTheme : theme'
        :placeholder='inputPlaceholder'
        :disabled='true'
        :values='options'
        :input='value'
        @value="v => value = v"
        @enter='enter'
        @select='selectDropValue'
      />
    </div>
    <div class='options'>
      <view-btn
        class='tiny'
        :waiting-response='false'
        @click="enter"
      >
        {{ btn }}
      </view-btn>
      <span v-if='showCancel' class='cancel pointer' @click="$emit('cancel')">Cancel</span>
      <div class='right'>
        <div v-if='allowProject' class='header-option'>
          <drop-finder
            handle='project-diagram'
            size='lg'
            min-width='300px'
            :list='sortedProjectsByName'
            @select='selectProject'
          />
        </div>
        <div v-if='allowDate' class='header-option'>
          <calendar-input @select='getDate'/>
        </div>
        <div v-if='allowLabels' class='header-option'>
          <drop-finder
            handle='tags'
            size='lg'
            min-width='300px'
            :list='sortedLabelsByName'
            @select='selectLabel'
          />
        </div>
        <div v-if='allowPriority' class='header-option'>
          <view-options
            handle='exclamation'
            size='lg'
            min-width='200px'
            :options='priorityIcons'
            @click="chosePriority"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace, State } from 'vuex-class'

const labelsVuex = namespace('label')
const projectVuex = namespace('project')
const set = namespace('settings')

import { ListIcon, Task, Label, TaskInputObj, Project } from '../../../../interfaces/app'

import Tag from '@/components/AppViews/AppviewComponents/AppviewTag.vue'
import AppviewIconoptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'
import DropdownInput from '@/components/DropdownInput.vue'
import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'
import DropdownFinder from '@/components/AppViews/AppviewComponents/DropdownFinder.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'
import CalendarInput from '@/components/AppViews/AppviewComponents/Tasks/AppviewCalendarInputIcon.vue'

import moment from 'moment-timezone'

import appUtils from '@/utils/app'
import { IndexState } from '../../../../interfaces/store/index'
import { LabelState, LabelGetters } from '../../../../interfaces/store/label'
import { SetState } from '../../../../interfaces/store/settings'
import { ProjectGetters } from '../../../../interfaces/store/project'

@Component({
  components: {
    'calendar-input': CalendarInput,
    'view-btn': FormButton,
    'drop-input': DropdownInput,
    'view-options': AppviewIconoptions,
    'view-tag': Tag,
    'drop-finder': DropdownFinder,
    'view-tags': AppviewTags,
  },
})
export default class AppviewTaskedit extends Vue {
  @State theme!: IndexState.theme

  @set.State timeFormat!: SetState.timeFormat
  @set.State timeZone!: SetState.timeZone
  @set.State nextWeek!: SetState.nextWeek

  @projectVuex.Getter sortedProjectsByName!: ProjectGetters.SortedProjectsByName

  @labelsVuex.Getter getLabelsByIds!: LabelGetters.GetLabelsByIds
  @labelsVuex.Getter sortedLabelsByName!: LabelGetters.SortedLabelsByName

  @Prop({default: 'Add task', type: String}) btn!: string
  @Prop({default: false, type: Boolean}) closeOnSave!: boolean
  @Prop(String) defaultValue!: string
  @Prop(String) fixedPers!: string
  @Prop(String) fixedLabel!: string
  @Prop(String) input!: string
  @Prop(String) defaultPriority!: string
  @Prop(String) defaultDate!: string
  @Prop(Array) defaultLabels!: string[]
  @Prop(String) inputTheme!: string
  @Prop(String) date!: string | null
  @Prop(String) time!: string | null
  @Prop(Boolean) allowPriority!: boolean
  @Prop(Boolean) allowProject!: boolean
  @Prop(Boolean) allowLabels!: boolean
  @Prop(Boolean) allowDate!: boolean
  @Prop({default: true, type: Boolean}) showCancel!: boolean

  value: string = ''
  optionsType: string = ''
  project: Project | null = null
  calendarString: string = ''
  stringToReplaceOnAdd: string = ''
  priority: '' | 'Low priority' | 'High priority' | 'Medium priority' = ''
  labels: string[] = []
  calendarObj: any = null
  options: string[] = []
  priorityIcons: ListIcon[] = [
    {
      name: 'High priority',
      icon: 'exclamation',
      iconColor: '#FF6B66',
      size: 'lg',
    },
    {
      name: 'Medium priority',
      icon: 'exclamation',
      iconColor: '#fff566',
      size: 'lg',
    },
    {
      name: 'Low priority',
      icon: 'exclamation',
      iconColor: '#70ff66',
      size: 'lg',
    },
  ]

  created() {
    if (this.defaultLabels)
      this.labels = this.defaultLabels.slice()
    if (this.defaultPriority)
      this.priority = this.defaultPriority as any
    if (this.defaultValue)
      this.value = this.defaultValue
    if (this.defaultDate)
      this.updateCalendarObj(this.defaultDate)
    else this.updateCalendarObj(this.date)
  }
  mounted() {
    const el = document.querySelectorAll('.taskedit')[0] as any
    setTimeout(() => {
      el.focus()
    }, 80)
  }

  selectDropValue(value: string) {
    const arr = this.value.split(' ')
    arr[arr.length - 1] = this.optionsType + value
    let str = ''
    for (const s of arr)
      str += s + ' '
    str = str.slice(0, -1)
    this.value = str
  }
  enter() {
    let utc = null
    let proId = ''
    if (this.project) proId = this.project.id
    if (this.calendarObj)
      utc = this.calendarObj.utc
    if (this.stringToReplaceOnAdd && this.calendarString)
      this.value = this.value.replace(this.stringToReplaceOnAdd, '')
    if (this.value)
      this.$emit('enter', {name: this.value, priority: this.priority, projectId: proId, labels: this.labels, utc})
    this.value = ''
  }
  removeLabel(id: string) {
    const index = this.labels.findIndex(el => el === id)
    this.labels.splice(index, 1)
  }
  selectLabel(label: Label) {
    this.labels.push(label.id)
  }
  selectProject(project: Project) {
    this.project = project
  }
  chosePriority(priority: 'Low priority' | 'High priority' | 'Medium priority') {
    this.priority = priority
  }
  removeCalendar() {
    this.calendarString = ''
    this.calendarObj = {utc: {time: '', date: ''}}
  }
  getDate(obj: any) {
    if (obj) {
      this.calendarString = obj.parsed
      this.calendarObj = obj
    } else {
      this.calendarString = ''
      this.calendarObj = null
    }
  }
  updateCalendarObj(date: string | null) {
    if (date) {
      let saved!: any
      if (!this.time)
        saved = moment.tz(`${date}`, 'Y-M-D', this.timeZone)
      else saved = moment.tz(`${date} ${this.time}`, 'Y-M-D HH:mm', 'UTC').tz(this.timeZone)
      const time = this.time ? this.time : ''
      this.calendarObj = {
        day: saved.format('D'),
        month: saved.format('M'),
        year: saved.format('Y'),
        utc: {
          time, date: saved.format('Y-M-D'),
        },
      }
      if (this.time) this.calendarObj['time'] = saved.format('HH:mm')
      this.calendarString = appUtils.parseTaskInputObjectToString(this.calendarObj, this.timeFormat, this.timeZone)
    }
  }

  get getLabels(): Label[] {
    return this.getLabelsByIds(this.labels)
  }
  get inputPlaceholder(): string {
    let str = 'Do something'
    if (this.allowPriority)
      str += ' !high !medium !low'
    if (this.allowLabels)
      str += ' #label'
    if (this.allowDate)
      str += ' $next thursday at 6:00'
    if (this.allowProject)
     str += ' @project name'
    return str
  }

  @Watch('value')
  onValue() {
    let changedOptions: boolean = false
    if (this.allowPriority) {
      const v = this.value
      if (v.includes(' !high') || v.includes(' !hi')) {
        this.priority = 'High priority'
        this.value = v.replace(' !high', '')
        this.value = v.replace(' !hi', '')
      } else if (v.includes(' !medium') || v.includes(' !me')) {
        this.priority = 'Medium priority'
        this.value = v.replace(' !medium', '')
        this.value = v.replace(' !me', '')
      } else if (v.includes(' !low') || v.includes(' !lo')) {
        this.priority = 'Low priority'
        this.value = v.replace(' !low', '')
        this.value = v.replace(' !lo', '')
      }
      const arr = this.value.split(' ')
      const lastWord = arr[arr.length - 1]
      if (lastWord[0] === '!') {
        this.optionsType = '!'
        const word = lastWord.substr(1)

        const options = []
        for (const i of this.priorityIcons)
          if (i.name && i.name === 'Low priority')
            options.push('low')
          else if (i.name && i.name === 'High priority')
            options.push('high')
          else options.push('medium')

        this.options = options.filter(el => el.includes(word))
        changedOptions = true
      }
    }
    if (this.allowLabels) {
      const labels = this.sortedLabelsByName
      for (const lab of labels)
        if (this.value.includes(` #${lab.name}`)) {
          this.value = this.value.replace(` #${lab.name}`, '')
          this.labels.push(lab.id)
          break
      }
      const arr = this.value.split(' ')
      const lastWord = arr[arr.length - 1]
      if (lastWord[0] === '#') {
        this.optionsType = '#'
        const word = lastWord.substr(1)

        this.options = labels.map(el => el.name).filter(el => el.includes(word))
        changedOptions = true
      }
    }
    if (this.allowProject) {
      const projects = this.sortedProjectsByName
      for (const pro of projects)
        if (this.value.includes(` @${pro.name}`)) {
          this.value = this.value.replace(` @${pro.name}`, '')
          this.project = pro
          break
      }
      const arr = this.value.split(' ')
      const lastWord = arr[arr.length - 1]
      if (lastWord[0] === '@') {
        this.optionsType = '@'
        const word = lastWord.substr(1)

        this.options = projects.map(el => el.name).filter(el => el.includes(word))
        changedOptions = true
      }
    }
    if (this.allowDate)
      if (this.value.includes(' $')) {
        const obj = appUtils.parseTaskInputTime(this.value, this.timeFormat, this.timeZone, this.nextWeek)
        const str = appUtils.parseTaskInputObjectToString(obj, this.timeFormat, this.timeZone)
        if (obj) {
          this.calendarObj = obj
          this.calendarString = str
          this.stringToReplaceOnAdd = this.value.substr(this.value.indexOf(' $'))
        }
      }
    if (!changedOptions)
      this.options = []
  }
  @Watch('input')
  onInput() {
    if (this.input)
      this.value = this.input
  }
}

</script>

<style scoped>

.task-adder {
  position: relative;
  z-index: 10;
}

.view-tags {
  position: relative;
}

.right {
  position: absolute;
  right: 0;
  display: inline-block;
}

.header-option {
  display: inline-block;
  margin-right: 10px;
}

.cancel {
  margin-left: 6px;
  color: #FF6B66;
}

.cancel:hover {
  text-decoration: underline;
}

.options {
  position: relative;
  display: flex;
  align-items: center;
}

.margin {
  margin-top: 1.5px !important;
}

.input-div {
  position: relative;
  z-index: 5;
}

</style>
