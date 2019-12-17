<template>
  <div class="RepeatPicker" :class="platform">
    <span>{{ l["Repeat:"] }}   </span>
    <AuthOptions
      :options='data.repeatOptions'
      :active='data.activeRepeatOption'
      minWidth='200px'
      @select='v => data.activeRepeatOption = v'
    />
    <div class="margin"></div>
    <div v-if="data.activeRepeatOption === 'After completion'">
      Repeat
      <AuthSimpleInput
        v-model="data.days"
        width='15px'
      />
       days after task completion.
    </div>
    <div v-else-if="data.activeRepeatOption === 'Daily'">
      Daily
    </div>
    <div v-else-if="data.activeRepeatOption === 'Weekly'">
      Weekly
    </div>
    <div v-else-if="data.activeRepeatOption === 'Monthly'">
      Monthly
    </div>
    <div v-else-if="data.activeRepeatOption === 'Yearly'">
      Yearl
    </div>
    <div class="hr"></div>
    <div class="extra-options margin">
      <div class="cont">
        Begins:
      </div>
      <div class="cont">
        <span class="option rb cursor" @click="getBeginDate">
          {{ data.begins }}
        </span>
      </div>
    </div>
    <div class="extra-options margin">
      <div class="cont">
        Deadline:
      </div>
      <div class="cont">
        <span class="option rb cursor" @click="getDeadlineDate">
          {{ deadlineStr }}
        </span>
      </div>
    </div>
    <div class="extra-options margin">
      <div class="cont">
        Ends:
      </div>
      <div class="cont">
        <AuthOptions
          :options='data.endOptions'
          :active='data.ends'
          minWidth='200px'
          @select='v => data.ends = v'
        />
        <template v-if="data.ends === 'After'">
          <span>&nbsp;</span>
          <AuthSimpleInput
            v-model="data.endTimes"
            width='15px'
          />
           <span>&nbsp;times</span>
        </template>
        <template  v-else-if="data.ends === 'On date'">
          <span>&nbsp;</span>
          <div class="option rb cursor"  @click="getEndDate">
            {{ data.endDate }}
          </div>
        </template>
      </div>
    </div>
    <AuthButton class="margin"
      value='Repeat task'
      @click="update"
    />
  </div>
</template>

<script>

import AuthOptions from "@/components/Auth/Options.vue"
import AuthSimpleInput from "@/components/Auth/SimpleInput.vue"
import AuthButton from "@/components/Auth/Button.vue"

import { mapGetters } from 'vuex'

import mom from 'moment/src/moment'

const TOD_STR = mom().format('Y/M/D')

export default {
  props: ['content'],
  components: {
    AuthOptions, AuthSimpleInput,
    AuthButton,
  },
  data() {
    return {
      data: {
        days: '1',
        activeRepeatOption: 'After completion',
        repeatOptions: [
          'After completion',
          'Daily',
          'Weekly',
          'Monthly',
          'Yearly',
        ],
        begins: TOD_STR,
        deadline: null,

        ends: 'Never',
        endOptions: [
          'Never',
          'After',
          'On date'
        ],
        endTimes: '1',
        endDate: TOD_STR,
      }
    }
  },
  created() {
    if (this.content && this.content.data)
      this.data = this.content.data
  },
  methods: {
    update() {

    },
    getDate(callback) {
      this.$emit('update', {
        comp: 'CalendarPicker',
        content: {
          onlyDates: true,
          payload: this.$data,
          callback: date => {
            return {
              comp: 'RepeatPicker',
              cardOptions: {
                overflow: true,
              },
              content: {
                data: {
                  ...this.data,
                  ...callback(date.specific),
                },
              }
            }
          }
        }
      })
    },
    getBeginDate() {
      this.getDate(date => ({
        begins: date,
      }))
    },
    getDeadlineDate() {
      this.getDate(date => ({
        deadline: date,
      }))
    },
    getEndDate() {
      this.getDate(date => ({
        endDate: date,
      }))
    },
  },
  computed: {
    ...mapGetters(['platform', 'l']),
    deadlineStr() {
      if (!this.data.deadline)
        return 'No deadline'
      return this.data.deadline
    }
  }
}

</script>

<style scoped>

.RepeatPicker.desktop {
  flex-basis: 450px;
  width: 450px;
  margin: 12px;
  padding: 0 12px;
}

.margin, .hr {
  margin-top: 12px;
}

.hr {
  border: 1px solid var(--dark);
}

.extra-options {
  display: flex;
}

.cont {
  flex-basis: 50%;
  display: flex;
  align-items: center;
}

.option {
  display: inline-block;
  padding: 6px;
  border: 1px solid var(--dark);
  transition-duration: .2s;
  background-color: none;
}

.option:hover {
  background-color: var(--light-gray);
}

</style>
