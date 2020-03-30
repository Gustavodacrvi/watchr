<template>
  <div class="ItemCont" @click='click'>
    <EditRaw v-if='showingEdit && (!showingCont || isEditing)'
      :name='name'
      :item='item'
      :editRawPlaceholder='editRawPlaceholder'
      :itemHeight='itemHeight'
      :editComponent='editComponent'
      :hasFirstTextField='true'
      :doneTransition='completeEditLeaveEvent'

      @close="close"
    >

      <template v-slot:check-icon>
        <slot name="check-icon" :forceDefault='true'></slot>
      </template>
      
    </EditRaw>
    <DisplayCont v-if="showingCont && completeEditLeave"
      :class="{transitioning}"
      :itemHeight='itemHeight'
    
      :name='name'
      :showLine='showLine'

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
  props: ['name', 'isEditing', 'itemHeight', 'editComponent', 'editRawPlaceholder', 'item'],
  data() {
    return {
      showElements: true,
      showLine: false,
      transitioning: false,
      showingCont: true,
      completeEditLeave: true,

      showingEdit: false,
    }
  },
  methods: {
    completeEditLeaveEvent() {
      this.completeEditLeave = true
    },
    click(evt) {
      if (this.transitioning)
        evt.stopPropagation()
    },
    animate() {
      this.showLine = true
    },
    close() {
      if (!this.transitioning)
        this.$emit('close')
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
        this.completeEditLeave = false
        this.transitioning = true
        this.showElements = true
        this.showingEdit = false
        this.showingCont = true
        setTimeout(() => {
          this.transitioning = false
        }, 200)
      }
    },
  },
}

</script>

<style scoped>

.ItemCont {
  width: 100%;
  min-height: 100%;
}

.transitioning {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
}

</style>
