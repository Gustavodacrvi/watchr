<template>
  <div class="ItemCont">
    <div class="cont">
      <div class="icon-wrapper">
        <slot name="check-icon"></slot>
      </div>
      <div>
        <div class="text">
          <transition
            appear
            @enter='infoEnter'
            @leave='infoLeave'
          >
            <Icon v-if="nameIcon"
              class="name-icon"
            
              :icon='nameIcon.name'
              :color='nameIcon.color'

              width='14px'
            />
          </transition>
          <span class="name-wrapper">
            <span class="name">
              <span v-html="parsedName"></span>
            </span>
            <span class="after-name">
              <slot name="after-name"></slot>
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
  props: ['name', 'nameIcon'],
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
        s.opacity = .7

        setTimeout(done, 250)
      })

    },
    leaveInfo(el, done) {
      const s = el.style

      s.transitionDuration = 0
      s.height = 'auto'
      s.opacity = .7

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

.name-wrapper {
  position: absolute;
  width: calc(100% - 35px);
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
}

.info {
  height: 40%;
  font-size: .825em;
  opacity: .7;
  overflow: visible;
}

</style>
