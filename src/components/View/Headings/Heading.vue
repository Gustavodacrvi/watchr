<template>
  <div class="Heading"
    :name='header.name'
    :id='header.id'
  >
    <transition name="fade" mode="out-in">
      <div v-if="!editing">
        <div class="header-wrapper handle cursor remove-highlight" key="wr"
          @click="click"
          @touchstart='touchStart'
          @touchend='touchEnd'
          
          v-longclick='longClick'
          @dblclick="toggleEditing"
          @mouseenter="onHover = true"
          @mouseleave="onHover = false"
        >
          <div class='circle-trans-wrapper-wrapper'>
            <div class="circle-trans-wrapper">
              <transition
                @enter='circleEnter'
              >
                <div v-if="showCircle" class="circle-trans-transition"
                  :style="{left, top, backgroundImage: `radial-gradient(var(--light-gray), var(--gray))`}"
                ></div>
              </transition>
            </div>
          </div>
          <div class="header">
            <span :style="{color}">
              <Icon v-if="hasProgress" class="icon"
                icon="tasks"
                color='var(--primary)'
                :progress="progress"
                width='15px'
              />
              <Icon v-else-if="icon" class="icon"
                :icon='icon'
                color='var(--primary)'
                width='22px'
              />
              <h3 class="name" :class="{hasIcon}">{{ name }}</h3>
            </span>
          </div>
        </div>
        <NotesApp :notes="notes" @save-notes="saveNote"/>
        <transition name="fade-t">
          <div v-show="showing && !movingHeading" class="cont">
            <slot></slot>
          </div>
        </transition>
      </div>
      <div v-else key="edig">
        <EditHeading
          :name='name'
          :errorToast='headingEditOptions.errorToast'
          :names='headingEditOptions.excludeNames'
          :buttonTxt='l["Save"]'
          @save='save'
          @cancel='toggleEditing'
        />
      </div>
    </transition>
  </div>
</template>

<script>

import IconDropVue from '../../IconDrop/IconDrop.vue'
import IconVue from '../../Icon.vue'
import EditVue from './Edit.vue'
import Notes from './Notes.vue'

import { mapGetters } from 'vuex'

import utils from '@/utils/'

export default {
  props: ['name', 'options', 'color', 'header', 'allowEdit', 'headingEditOptions', 'save', 'notes', 'movingHeading', 'progress', 'icon'],
  components: {
    IconDrop: IconDropVue,
    Icon: IconVue,
    EditHeading: EditVue,
    NotesApp: Notes,
  },
  mounted() {
    this.bindOptions()
  },
  data() {
    return {
      showing: true,
      onHover: false,
      editing: false,
      showCircle: false,
      isTouching: false,
      left: 0,
      top: 0,
      doingTransition: false,
      allowMobileOptions: false,
    }
  },
  methods: {
    longClick() {
      if (!this.isDesktop && !this.movingHeading) {
        window.navigator.vibrate(100)
        this.allowMobileOptions = true
      }
    },
    bindOptions() {
      if (this.isDesktop) {
        const header = this.$el.getElementsByClassName('header-wrapper')[0]
        utils.bindOptionsToEventListener(header, this.options, this)
      }
    },
    openMobileOptions() {
      this.$store.commit('pushIconDrop', this.options)
    },
    touchStart(e) {
      this.isTouching = true
      this.startX = e.changedTouches[0].clientX
      this.startY = e.changedTouches[0].clientY
      const rect = e.target.getBoundingClientRect()
      const scroll = document.scrollingElement.scrollTop
      if (!this.doingTransition) {
        this.left = (e.targetTouches[0].pageX - rect.left) + 'px'
        this.top = (e.targetTouches[0].pageY - rect.top - scroll) + 'px'
        this.showCircle = true
      }
    },
    click(evt) {
      if (this.isDesktop && !this.doingTransition) {
        this.showing = !this.showing
        this.left = evt.offsetX + 'px'
        this.top = evt.offsetY + 'px'
        this.showCircle = true
      }
    },
    touchEnd(e) {
      this.isTouching = false
      const touch = e.changedTouches[0]
      const movedFingerX = Math.abs(touch.clientX - this.startX) > 10
      const movedFingerY = Math.abs(touch.clientY - this.startY) > 10
      if (!movedFingerX && !movedFingerY) {
        if (this.allowMobileOptions)
          this.openMobileOptions()
        else this.showing = !this.showing
      }
      this.allowMobileOptions = false
    },
    circleEnter(el) {
      const s = el.style
      this.doingTransition = true

      const trans = str => {
        s.transition = `opacity ${str}, width ${str}, height ${str}, transform 0s, left 0s, top 0s, margin 0s`
      }
      let innerTrans = 450
      let outerTrans = 250
      if (this.isTouching) {
        innerTrans += 150
        outerTrans += 150
      }

      trans('0s')
      s.opacity = 0
      s.width = 0
      s.height = 0
      const client = this.$el.clientWidth
      const width = client + 100
      setTimeout(() => {
        trans(`.${innerTrans}s`)
        s.opacity = 1
        s.width = width + 'px'
        s.height = width + 'px'
        setTimeout(() => {
          trans(`.${outerTrans}s`)
          s.width = width + 'px'
          s.height = width + 'px'
          s.opacity = 0
          setTimeout(() => {
            trans('0')
            s.width = 0
            s.height = 0
            this.showCircle = false
            setTimeout(() => {
              this.doingTransition = false
            }, 50)
          }, innerTrans)
        }, outerTrans)
      }, 50)
    },
    toggleEditing() {
      if (this.allowEdit)
        this.editing = !this.editing
    },
    saveNote(notes) {
      this.$emit('save-notes', notes)
    },
  },
  computed: {
    ...mapGetters(['l', 'isDesktop']),
    showIconDrop() {
      const isDesktop = this.$store.getters.isDesktop
      if (isDesktop && this.onHover) return true
      else if (!isDesktop) return true
      return false
    },
    hasProgress() {
      return this.progress !== null && this.progress !== undefined
    },
    hasIcon() {
      return this.hasProgress || this.icon
    },
  },
  watch: {
    options() {
      this.bindOptions()
    },
  }
}

</script>

<style scoped>

.icons {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.icon {
  margin-left: 8px;
}

.IconDrop {
  transform: translateY(5px);
}

.Heading {
  margin: 14px 0;
  position: relative;
  z-index: 1;
}

.Heading:hover {
  z-index: 2;
}

.header-wrapper {
  padding: 0 6px;
  display: flex;
  align-items: center;
  margin: 14px 0;
  margin-bottom: 10px;
  height: 30px;
  z-index: 50;
  position: relative;
}

.cont {
  position: relative;
  z-index: 49;
}

.icon {
  transform: translate(-5px, 3px);
}

.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.name {
  display: inline-block;
  margin: 0;
  color: var(--primary);
}

.name.hasIcon {
  transform: translateX(8px);
}

</style>
