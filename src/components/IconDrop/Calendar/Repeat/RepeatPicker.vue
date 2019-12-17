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
    <div>
      Repeat
      <AuthSimpleInput
        v-model="data.days"
        width='15px'
      />
       days after task completion.
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
        <span class="option rb cursor">
          No Deadline
        </span>
      </div>
    </div>
    <div class="extra-options margin">
      <div class="cont">
        Ends:
      </div>
      <div class="cont">
        <span class="option rb cursor">
          Never
        </span>
      </div>
    </div>
  </div>
</template>

<script>

import AuthOptions from "@/components/Auth/Options.vue"
import AuthSimpleInput from "@/components/Auth/SimpleInput.vue"

import { mapGetters } from 'vuex'

import mom from 'moment/src/moment'

export default {
  props: ['content'],
  components: {
    AuthOptions, AuthSimpleInput,
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
        begins: mom().format('Y/M/D'),
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
    getBeginDate() {
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
                  begins: date.specific,
                },
              }
            }
          }
        }
      })
    },
  },
  computed: {
    ...mapGetters(['platform', 'l'])
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
