<template>
  <div class="DisplayCont" :class="{showLine}">
    <slot name='root'></slot>
    <div
      class="icon-wrapper"
      :style="{height: itemHeight + 'px'}"

      @click="$emit('toggle-complete')"
      @contextmenu="$emit('toggle-cancel')"
    >
      <slot name="check-icon"></slot>
    </div>
    <div class="content-name-wrapper" 
      :style="{minHeight: itemHeight + 'px'}"
    >
      <div class="text">
        <transition
          appear
          @enter='infoEnter'
          @leave='infoLeave'
        >
          <slot name='before-name'></slot>
        </transition>
        <span class="name-wrapper">
          <span class="line-wrapper">
            <span class="line"></span>
          </span>
          <span class="name">
            <span class="name-parsed" v-html="parsedName"></span>
          </span>
          <span class="after-name">
            <transition
              appear
              @enter='infoEnter'
              @leave='infoLeave'
            >
              <slot name="after-name"></slot>
            </transition>
          </span>
        </span>
      </div>
      <transition
        appear
      
        @enter='enterSecondRow'
        @leave='leaveSecondRow'
      >
        <slot
          name="info"
        ></slot>
      </transition>
    </div>
  </div>
</template>

<script>

import utils from '@/utils'

export default {
  props: ['name', 'showLine', 'itemHeight'],
  methods: {
    enterSecondRow(el, done) {
      const s = el.style
      
      const height = getComputedStyle(el).height

      s.transitionDuration = 0
      s.height = 0
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.height = height
        s.opacity = .6

        setTimeout(() => {
          s.height = 'auto'
          done()
        }, 200)
      })

    },
    leaveSecondRow(el, done) {
      const s = el.style

      const height = getComputedStyle(el).height

      s.transitionDuration = 0
      s.height = height

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.height = 0
        s.opacity = 0

        setTimeout(done, 200)
      })

    },
    infoEnter(el) {
      const s = el.style

      requestAnimationFrame(() => {
        const {width} = el.getBoundingClientRect()
        s.transitionDuration = 0
        s.width = 0
        s.opacity = 0
        s.marginRight = 0
  
        requestAnimationFrame(() => {
          s.transitionDuration = '.2s'
          s.width = width + 'px'
          s.marginRight = '9px'
          s.opacity = 1
        })
      })
    },
    infoLeave(el) {
      const s = el.style

      s.transitionDuration = '.2s'
      s.width = 0
      s.marginRight = 0
      s.opacity = 0
    },
  },
  computed: {
    parsedName() {
      return utils.parseHTMLStr(this.name)
    },
  },
}

</script>

<style scoped>

.name-wrapper, .DisplayCont, .text, .content-name-wrapper {
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
  width: 100%;
  overflow: hidden;
  justify-content: center;
  flex-direction: column;
  align-items: flex-start;
}

.name-wrapper {
  overflow: hidden;
  height: 100%;
  position: relative;
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
  width: 35px;
  flex-shrink: 0;
  opacity: .4;
}

.name-icon {
  transform: translateY(1px);
}

.text {
  height: 60%;
  max-width: 100%;
}

.info {
  height: 40%;
  font-size: .825em;
  opacity: .6;
  overflow: visible;
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
