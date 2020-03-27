<template>
  <div class="ItemCont">
    <EditRaw v-if='showingEdit'
      :class="{transitioning}"
      :style="{minHeight: itemHeight + 'px'}"
      :name='name'

      @close="$emit('close')"
    >

      <template v-slot:check-icon>
        <slot name="check-icon" :forceDefault='true'></slot>
      </template>
      
    </EditRaw>
    <DisplayCont v-if="showingCont"
      :name='name'
      :showLine='showLine'

      :style="{minHeight: itemHeight + 'px'}"
    
      @toggle-complete='$emit("toggle-complete")'
      @toggle-cancel='$emit("toggle-cancel")'
    >

      <template v-if="showElements" v-slot:check-icon>
        <slot name="check-icon"></slot>
      </template>

      <template v-if="showElements" v-slot:root>
        <slot name="root"></slot>
      </template>
      <template v-if="showElements" v-slot:after-name>
        <slot name="after-name"></slot>
      </template>
      <template v-if="showElements" v-slot:info>
        <slot name="info"></slot>
      </template>
      <template v-if="showElements" v-slot:before-name>
        <slot name="before-name"></slot>
      </template>
    
    </DisplayCont>
  </div>
</template>

<script>

import utils from '@/utils'

import DisplayCont from "./DisplayCont.vue"
import EditRaw from "./Edit/EditRaw.vue"

export default {
  components: {
    DisplayCont, EditRaw,
  },
  props: ['name', 'isEditing', 'itemHeight'],
  data() {
    return {
      showElements: true,
      showLine: false,
      transitionDone: false,
      showingCont: true,

      showingEdit: false,
    }
  },
  methods: {
    animate() {
      this.showLine = true
    },
  },
  watch: {
    isEditing() {
      if (this.isEditing) {
        this.transitioning = true
        this.showElements = false
        this.showingEdit = true
        setTimeout(() => {
          this.showingCont = false
          this.transitioning = false
        }, 200)
      } else {
        this.transitioning = true
        this.showElements = true
        this.showingCont = true
        setTimeout(() => {
          this.showingEdit = false
          this.transitioning = false
        }, 200)
      }
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

.transitioning {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
}

</style>
