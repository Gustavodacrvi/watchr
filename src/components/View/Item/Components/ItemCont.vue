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
          <span>
            {{ name }}
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

.cont {
  position: relative;
  height: 100%;
  width: 100%;

  display: flex;
  align-items: center;
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
  display: flex;
  align-items: center;
}

.info {
  height: 40%;
  font-size: .825em;
  opacity: .7;
  overflow: visible;
}

</style>
