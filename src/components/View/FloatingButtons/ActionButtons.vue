<template>
  <div class="ActionButtons passive" :class="platform" @click="click">
    <Btn v-if="showHeader" class="header button handle action-button" id="edit-component"
      icon='heading'
      color='white'
      data-type='headingbutton'
      :txt='l["Add heading"]'
    />
    <span v-else></span>
    <Btn class="add button handle action-button task-adder" id="edit-component"
      icon='plus'
      color='white'
      data-type='floatbutton'
      :txt='l["Add task"]'
    />
  </div>
</template>

<script>

import ActButtonVue from './ActButton.vue'

import { mapGetters } from 'vuex'

import Sortable from 'sortablejs'

export default {
  props: ['showHeader'],
  components: {
    Btn: ActButtonVue,
  },
  mounted() {
    this.sortable = new Sortable(this.$el, {
      group: {name: ['action-buttons', 'appnav'], pull: 'clone', put: false},
      handle: '.handle',
    })
  },
  methods: {
    click(evt) {
      const els = evt.path
      for (const e of els)
        if (e.classList.contains('task-adder')) {
          this.$store.dispatch('pushPopup', {comp: 'AddTask'})
          break
        }
    }
  },
  computed: {
    ...mapGetters(['platform', 'l'])
  }
}

</script>

<style scoped>

.ActionButtons {
  bottom: 16px;
  z-index: 15;
  pointer-events: none;
  position: sticky;
  display: flex;
  justify-content: space-between;
}

.ActionButtons .header {
  transform: translateX(-48px) !important;
  pointer-events: all;
}

.ActionButtons .add {
  transform: translateX(48px) !important;
  pointer-events: all;
}

.ActionButtons.mobile .button {
  transform: translateX(00px) !important;
}

</style>

<style>

.floating-btn-msg, .floating-btn-container .floating {
  display: none !important;
}

.floating-btn-container .floating-btn-msg {
  width: 98% !important;
  background-color: var(--void);
  box-shadow: none;
  border-radius: 6px;
  height: 40px;
  flex-grow: 1;
}

.TaskRenderer .task-act,
.Lists .list-act,
.Tags .tags-act {
  display: flex !important;
  justify-content: center;
  align-items: center;
}

</style>
