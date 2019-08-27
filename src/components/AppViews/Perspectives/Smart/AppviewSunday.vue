<template>
  <smart-pers pers-name='Sunday'/>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

import SmartPerspective from '@/components/AppViews/Perspectives/Smart/SmartPerspective.vue'

@Component({
  components: {
    'smart-pers': SmartPerspective,
  },
})
export default class ViewSunday extends Vue {}

</script>
