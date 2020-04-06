<template>
  <div class="DisplayCont rb" :class="{showLine}">
    <slot name='root'></slot>
    <div v-if="!isAdding"
      class="icon-wrapper"
      :style="{height: itemHeight + 'px'}"

      @click="$emit('toggle-complete')"
      @contextmenu="$emit('toggle-cancel')"
    >
      <slot name="check-icon"></slot>
    </div>
    <div v-if="!isAdding" class="content-name-wrapper" 
      :style="{minHeight}"
    >
      <div class="text-wrapper">
        <div class="text">
          <div class="main-cont">
            <transition-group
              appear
              @enter='infoEnter'
              @leave='infoLeave'
            >
              <slot name='before-name'></slot>
            </transition-group>
            <span class="name-wrapper">
              <span class="name">
                <span class="line-wrapper">
                  <span class="line"></span>
                </span>
                <span class="name-parsed" v-html="parsedName"></span>
              </span>
              <span class="after-name">
                <transition-group
                  appear
                  @enter='infoEnter'
                  @leave='infoLeave'
                >
                  <slot name="after-name"></slot>
                </transition-group>
              </span>
            </span>
          </div>
          <transition-group
            appear
            @enter='infoEnter'
            @leave='infoLeave'
          >
            <slot name='flex-end'></slot>
          </transition-group>
        </div>
        <transition
          appear
        
          @enter='enterSecondRow'
          @leave='leaveSecondRow'
        >
          <slot v-if="showInfo"
            name="info"
          ></slot>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>

import utils from '@/utils'

export default {
  props: ['name', 'showLine', 'itemHeight', 'isAdding', 'showInfo', 'infoReady'],
  data() {
    return {
      width: 0,
    }
  },
  methods: {
    enterSecondRow(el, done) {
      const s = el.style
      
      const height = 0

      s.transitionDuration = 0
      s.height = 0
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.height = height
        s.opacity = .4

        setTimeout(() => {
          s.height = '13px'
          done()
        }, 200)
      })

    },
    leaveSecondRow(el, done) {
      const s = el.style

      const height = '13px'

      s.transitionDuration = 0
      s.height = height
      s.opacity = .4

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.height = 0
        s.opacity = 0

        setTimeout(done, 200)
      })

    },
    infoEnter(el) {
      const s = el.style

      const width = getComputedStyle(el).width

      requestAnimationFrame(() => {
        s.transitionDuration = 0
        s.width = 0
        s.opacity = 0
        s.marginRight = 0
  
        requestAnimationFrame(() => {
          s.transitionDuration = '.2s'
          s.width = width
          s.marginRight = '9px'
          s.opacity = .9
          this.width = width

          setTimeout(() => {
            s.width = 'auto'
          }, 200)
        })
      })
    },
    infoLeave(el) {
      const s = el.style

      s.width = this.width

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.width = 0
        s.padding = 0
        s.border = 'none'
        s.margin = 0
        s.opacity = 0
      })
    },
  },
  computed: {
    parsedName() {
      return utils.parseHTMLStr(this.name)
    },
    minHeight() {
      return ((this.infoReady && this.showInfo) ? this.itemHeight + 6 : this.itemHeight) + 'px'
    },
  },
}

</script>

<style scoped>

.name-wrapper, .DisplayCont, .main-cont, .text, .content-name-wrapper {
  display: flex;
  align-items: center;
}

.after-name {
  margin-left: 9px;
}

.DisplayCont {
  position: relative;
  width: 100%;
  z-index: 5;
}

.content-name-wrapper {
  position: relative;
  width: 100%;
  align-items: center;
  transition: min-height .2s;
}

.text-wrapper {
  position: absolute;
  flex-direction: column;
  display: flex;
  justify-content: center;
  width: 100%;
}

.name-wrapper {
  overflow: hidden;
  height: 100%;
  max-width: 100%;
}

.name-parsed {
  transition: 0;
}

.name {
  max-width: 100%;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-wrapper {
  position: relative;
  height: 100%;
  width: 25px;
  flex-shrink: 0;
  opacity: .4;
}

.text {
  height: 60%;
  max-width: 100%;
  justify-content: space-between;
}

.info {
  height: 40%;
  font-size: .825em;
  overflow: hidden;
}

.line-wrapper {
  height: 100%;
  width: 100%;
  position: absolute;
  display: flex;
  align-items: center;
}

.line {
  width: 0;

  height: 3px;
  background-color: var(--txt);
  border-radius: 8px;
  transition-duration: .2s;
}

.showLine .line {
  width: 100%;
}

</style>
