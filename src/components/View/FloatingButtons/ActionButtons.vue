<template>
  <div class="ActionButtons passive" :class="[platform, {moving}]" @click="click">
    <Btn v-if="showHeader" class="header button handle action-button left-act" id="edit-component"
      icon='heading'
      color='white'
      data-type='headingbutton'
      :txt='l["Add heading"]'
    />
    <span v-else></span>
    <Btn class="add button handle action-button task-adder right-act" id="edit-component"
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
  data() {
    return {
      sortable: null,
      moving: false,
    }
  },
  mounted() {
    this.sortable = new Sortable(this.$el, {
      group: {name: ['action-buttons', 'appnav'], pull: 'clone', put: false},
      handle: '.handle',

      forceFallback: true,
      fallbackOnBody: true,

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
        if (e.classList.contains('task-adder')) {
          this.$store.dispatch('pushPopup', {comp: 'AddTask', naked: true})
          break
        }
    }
  },
  computed: {
    ...mapGetters(['platform', 'l', 'isDesktop'])
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
  transition: opacity .15s;
  opacity: 1;
}

.moving  .handle {
  opacity: 0;
}

.ActionButtons .header {
  transform: translateX(-48px) !important;
  pointer-events: all;
}

.ActionButtons .add {
  transform: translateX(48px) !important;
  pointer-events: all;
}

.ActionButtons.mobile .right-act {
  transform: translateX(-8px) !important;
}

.ActionButtons.mobile .left-act {
  transform: translateX(8px) !important;
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
