<template>
  <div>
    <draggable>
    </draggable>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

import Draggable from 'vuedraggable'

@Component({
  name: 'link-render',
  components: {
    draggable: Draggable,
  },
})
export default class AppnavLinkrenderer extends Vue {
  
}

</script>

<style scoped>

</style>
