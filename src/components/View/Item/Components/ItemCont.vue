<template>
  <div class="ItemCont" :class="{showLine}">
    <div class="cont">
      <slot name='root'></slot>
      <div
        class="icon-wrapper"

        @click="$emit('toggle-complete')"
        @contextmenu="$emit('toggle-complete')"
      >
        <slot
          name="check-icon"

          
        ></slot>
      </div>
      <div class="content-wrapper">
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
              <span v-html="parsedName"></span>
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
        
          @enter='enterInfo'
          @leave='leaveInfo'
        >
          <slot
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
  props: ['name'],
  data() {
    return {
      showLine: false,
    }
  },
  methods: {
    enterInfo(el, done) {
      const s = el.style
      
      const height = getComputedStyle(el).height

      s.transitionDuration = 0
      s.height = 0
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.height = height
        s.opacity = .6

        setTimeout(done, 250)
      })

    },
    leaveInfo(el, done) {
      const s = el.style

      s.transitionDuration = 0
      s.height = 'auto'
      s.opacity = .6

      requestAnimationFrame(() => {
        const height = getComputedStyle(el).height

        s.height = height

        requestAnimationFrame(() => {
          s.transitionDuration = '.2s'
          s.height = 0
          s.opacity = 0

          setTimeout(() => {
            s.height = 'auto'
            s.opacity = 0
            done()
          }, 210)
        })
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

    animate() {
      this.showLine = true
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

.ItemCont {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.name-wrapper, .cont, .text {
  display: flex;
  align-items: center;
}

.after-name {
  margin-left: 9px;
}

.cont {
  position: relative;
  height: 100%;
  width: 100%;
}

.content-wrapper {
  width: 100%;
  overflow: hidden;
}

.name-wrapper {
  overflow: hidden;
  position: relative;
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
