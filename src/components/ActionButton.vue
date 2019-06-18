<template>
  <div class='wrapper'>
    <div class='relative-wrapper'>
      
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

@Component({
  components: {
    icon: FontAwesomeIcon,
  },
})
export default class ActionButton extends Vue {
  public showing: boolean = false
}

</script>

<style scoped>

.wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 50;
}

.relative-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.action-button {
  
}


</style>
