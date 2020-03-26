<template>
  <div class="ItemCont" :class="{showLine}">
    <DisplayCont
      :name='name'
      :showLine='showLine'
    
      @toggle-complete='$emit("toggle-complete")'
      @toggle-cancel='$emit("toggle-cancel")'
    >

      <template v-slot:check-icon>
        <slot name="check-icon"></slot>
      </template>
      <template v-slot:root>
        <slot name="root"></slot>
      </template>
      <template v-slot:after-name>
        <slot name="after-name"></slot>
      </template>
      <template v-slot:info>
        <slot name="info"></slot>
      </template>
      <template v-slot:before-name>
        <slot name="before-name"></slot>
      </template>
    
    </DisplayCont>

    
  </div>
</template>

<script>

import utils from '@/utils'

import DisplayCont from "./DisplayCont.vue"

export default {
  components: {
    DisplayCont,
  },
  props: ['name', 'isEditing'],
  data() {
    return {
      showLine: false,
    }
  },
  methods: {
    animate() {
      this.showLine = true
    },
  },
}

</script>

<style scoped>

.ItemCont {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

</style>
