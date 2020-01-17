<template>
  <div class="ActionButtons passive" :class="[platform, {moving}]" @click="click">
    <span></span>
    <Btn v-if="showingTaskAdder" class="add-task-floating-button button handle action-button right-action-floating-button bright" id="edit-component"
      icon='plus'
      color='white'
      data-type='add-task-floatbutton'
      :txt='l["Create"]'
    />
  </div>
</template>

<script>

import ActButtonVue from './ActButton.vue'

import { mapGetters } from 'vuex'

import Sortable from 'sortablejs'

export default {
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
    },
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
  pointer-events: none;
}

.ActionButtons .header {
  transform: translateX(-48px) !important;
  pointer-events: none;
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

.ActButton .act-button-wrapper, .floating-btn-container .floating, .floating-btn-msg {
  display: none !important;
}

.floating-btn-container .act-button-wrapper {
  display: flex !important;
  width: 98% !important;
  box-shadow: none;
  border-radius: 6px;
  flex-grow: 1;
}

.act-button-wrapper .cont {
  display: flex;
  justify-content: center !important;
  align-items: center !important;
  height: 100%;
  flex-basis: 100%;
  background-color: var(--void);
  border-radius: 10px;
  transition: background-color .2s, box-shadow;
}

.floating-btn-container .floating-btn-msg {
  height: 100%;
  justify-content: center;
  align-items: center;
}

.ListRenderer .task-act,
.Lists .list-act,
.Tags .tags-act {
  display: flex !important;
}

.Lists .act-button-wrapper .cont, .Tags .act-button-wrapper .cont {
  display: none !important;
}

.Lists .act-button-wrapper .main, .Tags .act-button-wrapper .main {
  display: block !important;
  flex-basis: 100%;
}

.Lists .list-act, .Tags .tags-act {
  border-radius: 10px;
  background-color: var(--card);
}

.Checklist .heading, .Checklist .existing {
  display: none !important;
}

</style>
