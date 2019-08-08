<template>
  <calendar-input @select='select'/>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

import CalendarInputComp from '@/components/AppViews/AppviewComponents/Tasks/AppviewCalendarInput.vue'

@Component({
  components: {
    'calendar-input': CalendarInputComp,
  },
})
export default class CenteredCardCalendarInput extends Vue {

  select(obj: any) {
    console.log(obj)
  }
}

</script>

