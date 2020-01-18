<template>
  <div class="Info" style="flex-direction: column; align-items: flex-start;margin-top: 4px">
<!--     <div>
      <HeaderInfo
        icon="sleep"
        :info="`${l['Defered to']}:`"
        :content="defer"
        :left="deferDaysLeft"
        @click="$parent.$parent.$emit('remove-defer-date')"
      />
    </div> -->
    <div>
      <HeaderInfo
        icon="deadline"
        :content="deadlineHumanReadable"
        :left="deadlineDaysLeft"
        :options='deadlineOptions'
        @save='saveOptions'
      />
<!--       <HeaderInfo
        icon='repeat'
        info=''
        :content='repeatCalendar'
        :left='repeatCalendarNextEvent'
        @click="$parent.$emit('remove-repeat')"
      /> -->
    </div>
<!--     <div class="tags">
      <Tag class="tag" v-for="t in headerTags" :key="t"
        :value="t"
        icon="tag"
        @click="$parent.$emit('remove-header-tag', t)"
      />
    </div> -->
  </div>
</template>

<script>

import HeaderInfo from './../HeaderInfo.vue'

import { mapGetters } from 'vuex'

import mom from 'moment'

const TOD_STR = mom().format('Y-M-D')

import utils from '@/utils'

import Tag from './../../Tag.vue'

export default {
  components: {
    HeaderInfo, Tag,
  },
  props: ['headerTags', 'deadline', 'headerCalendar', 'save'],
  methods: {
    saveOptions(obj) {
      if (this.save)
        this.save(obj)
    },
  },
  computed: {
    ...mapGetters({
      l: 'l',
      userInfo: 'userInfo',

      getListDeadlineDaysLeftStr: 'list/getListDeadlineDaysLeftStr',
    }),
    deadlineHumanReadable() {
      return this.deadline ? utils.getHumanReadableDate(this.deadline, this.l) : null
    },
    deadlineDaysLeft() {
      return this.deadline ? this.getListDeadlineDaysLeftStr(this.deadline, TOD_STR) : null
    },
    deadlineOptions() {
      return save => ({
          comp: 'CalendarPicker',
          content: {
            onlyDates: true,
            noTime: true,
            allowNull: true,
            callback: ({specific}) => save({deadline: specific})
          }
        })
    },
  }
}

</script>
