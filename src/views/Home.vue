<template>
  <div>
    <span class='txt'>home</span>
    <sortable></sortable>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import Sortable from '@/components/Sortablejs.vue'

@Component({
  components: {
    'sortable': Sortable,
  },
})
export default class Home extends Vue {}

</script>
