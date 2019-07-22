<template>
  <div>
    <h2 id='View'>View</h2>
    <h3 id='Desktop'>Desktop</h3>
    <div class='table'>
      <div class='line' :class='platform'>
        <div class='text'>
          <span class='txt' :class='theme'>Task labels</span>
        </div>
        <div class='content'>
          <form-options
            max-height='300px'
            :selected='desktopTaskLabels'
            :options='taskLabelOptions'
            @select='v => desktopTaskLabels = v'
          />
        </div>
      </div>
    </div>
    <h3 id='Mobile'>Mobile</h3>
    <div class='table'>
      <div class='line' :class='platform'>
        <div class='text'>
          <span class='txt' :class='theme'>Task labels</span>
        </div>
        <div class='content'>
          <form-options
            max-height='300px'
            :selected='mobileTaskLabels'
            :options='taskLabelOptions'
            @select='v => mobileTaskLabels = v'
          />
        </div>
      </div>
    </div>
    <h2 id='DateandTime'>Date and Time</h2>
    <div class='table'>
      <div class='line' :class='platform'>
        <div class='text'>
          <span class='txt' :class='theme'>Time zone</span>
        </div>
        <div class='content'>
          <form-options
            max-height='300px'
            :enable-search='true'
            :parse='true'
            :selected='parsedTimeZone'
            :options='timeZones'
            @select='v => timeZone = v'
          />
        </div>
      </div>
      <div class='line' :class='platform'>
        <div class='text'>
          <span class='txt' :class='theme'>Date format</span>
        </div>
        <div class='content'>
          <form-options
            max-height='100px'
            :options="['DD-MM-YYYY', 'MM-DD-YYYY']"
            :selected='dateFormat'
            @select='v => dateFormat = v'
          />
        </div>
      </div>
      <div class='line' :class='platform'>
        <div class='text'>
          <span class='txt' :class='theme'>Time format</span>
        </div>
        <div class='content'>
          <form-options
            max-height='100px'
            :options="['1:00pm', '13:00']"
            :selected='timeFormat'
            @select='v => timeFormat = v'
          />
        </div>
      </div>
    </div>
    <hr class='border themeatic-break hr' :class='theme'>
    <div class='table'>
      <div class='line' :class='platform'>
        <div class='text'>
          <span class='txt'>Start of the week</span>
        </div>
        <div class='content'>
          <form-options
            max-height='300px'
            :selected='startOfTheWeek'
            :options='weeks'
            @select='v => startOfTheWeek = v'
          />
        </div>
      </div>
      <div class='line' :class='platform'>
        <div class='text'>
          <span class='txt'>Next week</span>
        </div>
        <div class='content'>
          <form-options
            :selected='nextWeek'
            :options='weeks'
            max-height='300px'
            @select='v => nextWeek = v'
          />
        </div>
      </div>
    </div>
    <form-button class='tiny right' :waiting-response='false' :block-button='!hasChange' @click='save'>
      Save settings
    </form-button>
    <span></span>
    <form-button class='tiny left' :waiting-response='false' @click='reset'>
      Reset settings
    </form-button>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { Getter, State, namespace } from 'vuex-class'

const settingsVuex = namespace('settings')

import Moment from 'moment'
import 'moment-timezone/builds/moment-timezone-with-data'

import FormOptions from '@/components/PopUps/FormComponents/FormOptions.vue'
import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'

import appUtils from '@/utils/app'

@Component({
  components: {
    'form-options': FormOptions,
    'form-button': FormButton,
  },
})
export default class GeneralSubView extends Vue {
  @State theme!: string
  @Getter platform!: string

  @settingsVuex.State('timeZone') savedTimeZone!: string
  @settingsVuex.State('dateFormat') savedDateFormat!: string
  @settingsVuex.State('timeFormat') savedTimeFormat!: string
  @settingsVuex.State('startOfTheWeek') savedStartOfTheWeek!: string
  @settingsVuex.State('nextWeek') savedNextWeek!: string
  @settingsVuex.State('mobileTaskLabels') savedMobileTaskLabels!: string
  @settingsVuex.State('desktopTaskLabels') savedDesktopTaskLabels!: string

  @settingsVuex.Action saveSettings!: (obj: {
    timeZone: string,
    dateFormat: string,
    timeFormat: string,
    startOfTheWeek: string,
    nextWeek: string,
    desktopTaskLabels: string,
    mobileTaskLabels: string,
  }) => void
  @settingsVuex.Action setDefaultSettings!: () => void

  selected: string = 'option 1'

  timeZone: string = ''
  dateFormat: string = ''
  timeFormat: string = ''

  startOfTheWeek: string = ''
  nextWeek: string = ''
  mobileTaskLabels: string = ''
  desktopTaskLabels: string = ''

  taskLabelOptions: string[] = [
    'Always show', 'Show on mouse/touch hover',
  ]

  created() {
    this.getData()
  }

  getData() {
    const m = Moment as any

    this.timeZone = this.savedTimeZone
    this.dateFormat = this.savedDateFormat
    this.timeFormat = this.savedTimeFormat
    this.startOfTheWeek = this.savedStartOfTheWeek
    this.nextWeek = this.savedNextWeek
    this.mobileTaskLabels = this.savedMobileTaskLabels
    this.desktopTaskLabels = this.savedDesktopTaskLabels

    if (this.timeZone === '')
      this.timeZone = m.tz.guess()
  }
  save() {
    this.saveSettings({
      timeZone: this.deParsedTimeZone,
      dateFormat: this.dateFormat,
      timeFormat: this.timeFormat,
      nextWeek: this.nextWeek,
      startOfTheWeek: this.startOfTheWeek,
      mobileTaskLabels: this.mobileTaskLabels,
      desktopTaskLabels: this.desktopTaskLabels,
    })
  }
  reset() {
    this.setDefaultSettings()
  }

  get timeZones(): string[] {
    const m = Moment as any
    return m.tz.names()
  }
  get weeks(): string[] {
    return [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]
  }
  get parsedTimeZone(): string {
    return appUtils.parseMomentTimeZone(this.timeZone)
  }
  get deParsedTimeZone(): string {
    return appUtils.deParseMomentTimeZone(this.timeZone)
  }
  get hasChange(): boolean {
    if (this.deParsedTimeZone !== this.timeZone) return true
    else if (this.dateFormat !== this.savedDateFormat) return true
    else if (this.startOfTheWeek !== this.savedStartOfTheWeek) return true
    else if (this.nextWeek !== this.savedNextWeek) return true
    else if (this.mobileTaskLabels !== this.savedMobileTaskLabels) return true
    else if (this.desktopTaskLabels !== this.savedDesktopTaskLabels) return true
    return false
  }

  @Watch('savedTimeZone')
  onChange() {
    this.getData()
  }
}

</script>

<style scoped>

.tiny {
  margin: 0 !important;
}

.right {
  float: right;
  clear: right;
}

.left {
  float: left;
  clear: left;
}

.hr {
  width: 95%;
}

.table {
  margin: 30px 0;
}

.line.desktop {
  display: flex;
}

.line + .line {
  margin-top: 10px;
}

.text {
  flex-basis: 50%;
  display: flex;
  align-items: center;
}

.content {
  flex-basis: 50%;
}

</style>
