<template>
  <div class="ActionButtons passive"
    :class="[layout, {moving}]"
    @click="click"
  >
    <span v-if="moving"></span>
    <Btn v-if="showingTaskAdder" class="add-task-floating-button button handle action-button right-action-floating-button bright" id="edit-component"
      icon='plus'
      color='white'
      data-type='add-task-floatbutton'
      txt='Add item'
    />
    <span v-if="!moving"></span>
    <div
      class="inbox-wrapper"
      ref='inbox-wrapper'

      @pointerenter='inboxHover = true'
      @pointerleave='leaveHover'
    >
      <transition name='trans-t'>
        <div v-if="moving"
          class="inbox"
          :class="{inboxHover}"
        >
          <Icon
            icon='inbox'
            width='22px'
            color='white'
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script>

import ActButtonVue from './ActButton.vue'

import { mapGetters, mapState } from 'vuex'

import Sortable from 'sortablejs'

export default {
  props: ['menu'],
  components: {
    Btn: ActButtonVue,
  },
  data() {
    return {
      sortable: null,
      showingTaskAdder: false,
      moving: false,
      inboxHover: false,
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
      group: {name: ['action-buttons', 'sidebar'], pull: 'clone', put: false},
      handle: '.floating-button-handle',
      animation: 200,

      fallbackClass: "sortable-fallback",
      forceFallback: true,
      delay: 10,
      fallbackOnBody: true,
      fallbackTolerance: 0,

      onStart: () => {
        this.moving = true
      },
      onMove: evt => evt.to !== this.$el,
      onEnd: () => {
        if (this.inboxHover)
          this.openQuickAdd()
        this.moving = false
      },
    })
  },
  beforeDestroy() {
    this.sortable.destroy()
  },
  methods: {
    openQuickAdd() {
      this.$store.dispatch('pushPopup', {comp: 'AddTask', naked: true,})
    },
    leaveHover() {
      setTimeout(() => {
        this.inboxHover = false
      }, 100)
    },
    runTransition() {
      // FLIP
      const target = this.$el.childNodes[1]
      if (!target) return;

      const { top, height, left, width } = document.getElementById('item-renderer-root').getBoundingClientRect()
      const edit = target.getBoundingClientRect()

      const initial = {
        left: edit.left,
        top: edit.top,
      }
      const final = {
        top: (top + height + (this.itemHeight / 2)),
        left: (left + ((width / 2) - (this.isDesktopBreakPoint ? 25 : 50)))
      }

      const s = target.style

      const yDiff = final.top - initial.top
      const xDiff = final.left - initial.left

      s.transitionDuration = 0

      s.transform = 'translate(0px, 0px) scale(1,1)'

      requestAnimationFrame(() => {
        s.transitionDuration = this.isDesktopBreakPoint ? '.2s' : '.2s'
        s.transitionTimingFunction = 'ease-out'

        s.transform = `translate(${xDiff}px, ${yDiff}px) scale(.95,.95)`
        const onEnd = () => {
          this.$emit('add-task')
          s.transform = `translate(0px, 0px) scale(1,1)`
          target.removeEventListener('transitionend', onEnd)
        }
        target.addEventListener('transitionend', onEnd)
      })

      
    },
    click(evt) {
      const path = event.path || (event.composedPath && event.composedPath())
      const els = path
      for (const e of els)
        if (e.classList && e.classList.contains('add-task-floating-button')) {
          if (!this.menu)
            this.runTransition()
          else
            this.openQuickAdd()
          break
        }
    },
  },
  computed: {
    ...mapState(['buttonTarget']),
    ...mapGetters(['layout', 'itemHeight', 'isDesktopBreakPoint'])
  },
  watch: {
    moving() {
      this.$store.commit('moving', this.moving)
    }
  }
}

</script>

<style scoped>

.inbox-wrapper {
  width: 55px;
  height: 55px;
  display: flex;
  overflow: visible;
  position: relative;
}

.inbox {
  background-color: var(--dark-void);
  width: 55px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  pointer-events: all;
  border-radius: 1000px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 55px;
  overflow: hidden;
  transition-duration: .2s;
}

.inboxHover {
  width: 80px;
  height: 80px;
}

.trans-t-enter, .trans-t-leave-to {
  height: 0;
  width: 0;
  opacity: 0;
}

.trans-t-leave, .trans-t-enter-to {
  height: 55px;
  width: 55px;
  opacity: 1;
}

.ActionButtons {
  bottom: 16px;
  z-index: 15;
  position: sticky;
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  transition: opacity .2s;
  opacity: 1;
  pointer-events: none;
}

/* .ActionButtons .header {
  transform: translateX(-18px) !important;
  pointer-events: none;
}
 */
.ActionButtons .add-task-floating-button {
  transform: translateX(18px);
  pointer-events: all;
}

.ActionButtons.mobile .right-action-floating-button {
  transform: translateX(-8px);
}

/* .ActionButtons.mobile .left-act {
  transform: translateX(8px) !important;
} */

</style>

<style>

.moving .ActButton {
  display: none;
}

.ActButton {
  transition-duration: 0s;
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
}

.act-button-wrapper .main {
  background-color: var(--sidebar-color);
  border-radius: 6px;
  transition: background-color .2s, box-shadow;
}

.act-button-wrapper .heading {
  border: none;
  justify-content: unset !important;
  padding-left: 6px;
  border-bottom: 1px solid var(--fade);
  border-bottom-style: dashed;
  opacity: 0;
}

.heading .main {
  display: flex;
  justify-content: center !important;
  align-items: center !important;
  height: 100%;
  flex-basis: 100%;
  background-color: var(--sidebar-color);
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

.slim-sidebar .Lists .list-act, .slim-sidebar .Tags .tags-act {
  border-radius: 10px;
  background-color: var(--dark-light-gray);
}

.Checklist .heading, .Checklist .existing {
  display: none !important;
}

</style>
