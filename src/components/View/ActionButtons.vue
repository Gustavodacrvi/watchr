<template>
  <div class="ActionButtons" :class="platform" @click="click">
    <Btn v-if="showHeader" class="header button handle action-button"
      icon='user'
      color='white'
    />
    <span v-else></span>
    <Btn class="add button handle action-button task-adder" id="addtask"
      icon='plus'
      color='white'
      txt='Add task'
      data-type='addtask'
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
      group: {name: 'action-buttons', pull: 'clone', put: false},
      handle: '.handle',

      onUpdate: (evt) => {
        console.log(evt)
      },
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
    ...mapGetters(['platform'])
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

.ActionButtons .floating, .TaskRenderer .renderer {
  display: block;
}

.TaskRenderer .floating, .ActionButtons .renderer {
  display: none;
}

.TaskRenderer .ActButton {
  width: 100%;
  border: 1px solid var(--white);
  border-radius: 6px;
  height: 40px;
}

</style>
