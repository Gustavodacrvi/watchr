<template>
  <div class="ActionButtons passive" :class="[platform, {moving}]" @click="click">
    <Btn v-if="showHeader" class="header button handle action-button left-act" id="edit-component"
      icon='heading'
      color='white'
      data-type='headingbutton'
      :txt='l["Add heading"]'
    />
    <span v-else></span>
    <Btn v-if="showingTaskAdder" class="add-task-floating-button button handle action-button right-action-floating-button" id="edit-component"
      icon='plus'
      color='white'
      data-type='add-task-floatbutton'
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
  data() {
    return {
      sortable: null,
      showingTaskAdder: false,
      moving: false,
    }
  },
  created() {
    this.showingTaskAdder = false
  },
  mounted() {
    setTimeout(() => {
      this.showingTaskAdder = true
    }, 700)
    this.sortable = new Sortable(this.$el, {
      group: {name: ['action-buttons', 'appnav'], pull: 'clone', put: false},
      handle: '.floating-button-handle',
      animation: 80,

      fallbackClass: "sortable-fallback",
      forceFallback: true,
      fallbackOnBody: true,
      fallbackTolerance: 0,

      onStart: () => {
        this.moving = true
      },
      onEnd: () => {
        this.moving = false
      },
    })
  },
  beforeDestroy() {
    this.sortable.destroy()
  },
  methods: {
    click(evt) {
      const els = evt.path
      for (const e of els)
        if (e.classList && e.classList.contains('add-task-floating-button')) {
          setTimeout(() => {
            this.$store.dispatch('pushPopup', {comp: 'AddTask', naked: true,})
          }, 50)
          break
        }
    }
  },
  computed: {
    ...mapGetters(['platform', 'l', 'isDesktop'])
  },
  watch: {
    moving() {
      this.$emit('moving', this.moving)
    }
  }
}

</script>

<style scoped>

.ActionButtons {
  bottom: 16px;
  z-index: 15;
  position: sticky;
  display: flex;
  justify-content: space-between;
  transition: opacity .15s;
  opacity: 1;
}

.ActionButtons .header {
  transform: translateX(-48px) !important;
  pointer-events: all;
}

.ActionButtons .add-task-floating-button {
  transform: translateX(48px) !important;
  pointer-events: all;
}

.ActionButtons.mobile .right-action-floating-button {
  transform: translateX(-8px) !important;
}

.ActionButtons.mobile .left-act {
  transform: translateX(8px) !important;
}

</style>

<style>

.moving .ActButton {
  display: none;
}

.ActButton {
  transition-duration: 0s !important;
}

.floating-btn-msg, .floating-btn-container .floating {
  display: none !important;
}

.floating-btn-container .floating-btn-msg {
  width: 98% !important;
  background-color: var(--void);
  box-shadow: none;
  border-radius: 6px;
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
