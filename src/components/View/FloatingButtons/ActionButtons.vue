<template>
  <div class="ActionButtons passive" :class="platform" @click="click">
    <Btn v-if="showHeader" class="header button handle action-button" id="edit-component"
      icon='user'
      color='white'
      data-type='headingbutton'
      txt='Add heading'
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
        if (e.id === 'addtask') {
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
  transform: translateX(0px) !important;
}

</style>

<style>

.tags-act {
  display: none;
}

.ActionButtons .floating, .TaskRenderer .task-renderer, .appnav-section .tags-act {
  display: block;
}

.TaskRenderer .floating, .ActionButtons .renderer, .appnav-section .floating, .appnav-section .task-renderer {
  display: none;
}

.TaskRenderer .ActButton, .appnav-section .ActButton {
  width: 98%;
  border: 1px solid var(--white);
  border-radius: 6px;
  height: 40px;
  flex-grow: 1;
}

</style>
