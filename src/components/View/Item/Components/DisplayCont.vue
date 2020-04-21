<template>
  <div class="DisplayCont rb" :class="{showLine, iconHover}">
    <slot name='root'></slot>
    <div v-if="!isAdding"
      class="icon-wrapper"
      :style="{height: itemHeight + 'px'}"

      @mouseenter="iconHover = true"
      @mouseleave="iconHover = false"

      @click.stop="$emit('toggle-complete')"
      @contextmenu.prevent.stop="$emit('toggle-cancel')"
    >
      <slot name="check-icon"></slot>
    </div>
    <div v-if="!isAdding" class="content-name-wrapper" 
      :style="{minHeight}"
    >
      <div class="text-wrapper">
        <div class="text">
          <div class="main-cont">
            <span class="line-wrapper">
              <span class="line"></span>
            </span>
            <transition-group
              appear
              @enter='infoEnter'
              @leave='infoLeave'
            >
              <slot name='before-name'></slot>
            </transition-group>
            <div class="name-wrapper">
              <span class="name">
                <span class="name-parsed" v-html="parsedName"></span>
              </span>
              <div class="after-name">
                <transition-group
                  appear
                  @enter='infoEnter'
                  @leave='infoLeave'
                >
                  <slot name="after-name"></slot>
                </transition-group>
              </div>
            </div>
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
      iconHover: false,
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
        s.transitionDuration = '.15s'
        s.height = height
        s.opacity = .7

        setTimeout(() => {
          s.height = '10px'
          done()
        }, 200)
      })

    },
    leaveSecondRow(el, done) {
      const s = el.style

      const height = '10px'

      s.transitionDuration = 0
      s.height = height
      s.opacity = .7

      requestAnimationFrame(() => {
        s.transitionDuration = '.15s'
        s.height = 0
        s.opacity = 0

        setTimeout(done, 200)
      })

    },
    infoEnter(el) {
      const s = el.style

      const width = el.offsetWidth + 'px'

      const isFirst = el.dataset.isfirstcontelement = 'isfirstcontelement'

      requestAnimationFrame(() => {
        s.transitionDuration = 0
        s.width = 0
        s.opacity = 0
        s.marginRight = 0

        if (isFirst)
          s.marginLeft = 0
  
        requestAnimationFrame(() => {
          s.transitionDuration = '.15s'
          s.width = width
          s.marginRight = '6px'
          if (isFirst)
            s.marginLeft = '2px'
          s.opacity = 1
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
        s.transitionDuration = '.15s'
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
      return ((this.infoReady && this.showInfo) ? this.itemHeight + 8 : this.itemHeight) + 'px'
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
  transition: min-height .15s;
}

.text-wrapper {
  position: absolute;
  flex-direction: column;
  display: flex;
  justify-content: center;
  width: calc(100% - 10px);
}

.main-cont {
  position: relative;
  width: 100%;
}

.name-wrapper {
  height: 100%;
  position: relative;
  z-index: 1;
  max-width: 100%;
  min-width: 0;
}

.name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: block;
}

.name-parsed {
  position: relative;
  transition: 0;
  z-index: 2;
  padding-right: 1px;
}

.icon-wrapper {
  position: relative;
  height: 100%;
  width: 25px;
  flex-shrink: 0;
  opacity: .4;
  transition-duration: .15s;
}

.iconHover .icon-wrapper, .showLine .icon-wrapper {
  opacity: 1;
}

.text {
  height: 11.5px;
  max-width: 100%;
  position: relative;
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
  z-index: 2;
  visibility: hidden;
}

.showLine .line-wrapper {
  visibility: visible;
}

.line {
  width: 0;
  height: 3px;
  background-color: var(--txt);
  border-radius: 8px;
  transition-duration: .15s;
}

.showLine .line {
  width: 100%;
}

</style>
